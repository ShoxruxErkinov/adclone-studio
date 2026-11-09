import { z } from 'zod';
import { NextResponse } from 'next/server';
import { context,configured,consumeQuota,assetUrl as signedAssetUrl,credits,deleteProject,enqueue,listProjects,listRenders,saveProject,workerAlive } from '@/lib/repository';
import { assetUrl, createDraft, projectInputSchema, productSchema, scriptText } from '@/lib/model';
import { generateScript, generateVoice, importProduct, removeBackground } from '@/lib/providers';
import { limitedBody } from '@/lib/http';
export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';
const language = z.enum(['uz','ru','en','kk','tr']);
const input = z.discriminatedUnion('action',[
  z.object({action:z.literal('import'),url:z.string().url().max(2000)}),
  z.object({action:z.literal('script'),product:productSchema,language,duration:z.union([z.literal(15),z.literal(30)]),variant:z.number().int().min(0).max(1000).default(0)}),
  z.object({action:z.literal('save'),project:projectInputSchema,id:z.string().uuid().optional()}),
  z.object({action:z.literal('export'),project:projectInputSchema,id:z.string().uuid().optional()}),
  z.object({action:z.literal('voice'),project:projectInputSchema}),
  z.object({action:z.literal('background'),image:assetUrl}),
  z.object({action:z.literal('delete'),id:z.string().uuid()}),
  z.object({action:z.literal('asset'),url:assetUrl}),
  z.object({action:z.literal('demo')})
]);
export async function GET(request: Request) {
  try {const ctx=await context(request,true);const [projects,renders,balance,worker]=await Promise.all([listProjects(ctx),listRenders(ctx),credits(ctx),ctx.user?workerAlive(ctx):Promise.resolve(false)]);const assetUrls:Record<string,string>={};if(ctx.user)await Promise.all(renders.filter(r=>r.asset).map(async r=>{const key=`/api/assets/${r.asset}`;assetUrls[key]=await signedAssetUrl(ctx,key);}));return NextResponse.json({projects,renders,credits:balance,user:ctx.user,authConfigured:configured(),assetUrls,services:{gemini:!!process.env.GEMINI_API_KEY,voice:!!(process.env.ELEVENLABS_API_KEY&&process.env.ELEVENLABS_VOICE_ID),scraper:!!process.env.FIRECRAWL_API_KEY,background:!!process.env.REMOVE_BG_API_KEY,worker}});}
  catch(e) {return NextResponse.json({error:e instanceof Error?e.message:'Ulanishda xatolik.'},{status:403});}
}
export async function POST(request: Request) {
  try {
    const ctx=await context(request);
    const data = input.parse(JSON.parse((await limitedBody(request)).toString('utf8')));
    if(['import','script','voice','background'].includes(data.action))await consumeQuota(ctx,data.action);
    switch(data.action){
      case 'import': return NextResponse.json({product:await importProduct(data.url,ctx)});
      case 'script': return NextResponse.json(await generateScript(data.product,data.language,data.duration,data.variant));
      case 'demo': return NextResponse.json({project:createDraft()});
      case 'asset': return NextResponse.json({url:await signedAssetUrl(ctx,data.url)});
      case 'background': return NextResponse.json({image:await removeBackground(data.image,ctx)});
      case 'voice': return NextResponse.json({voice:await generateVoice(data.project,ctx)});
      case 'delete': await deleteProject(ctx,data.id);return NextResponse.json({ok:true});
      case 'save': case 'export': {
        // Stale audio must never survive a script change, including direct API clients.
        const projectInput = {...data.project,voice:data.project.voice?.text===scriptText(data.project)?data.project.voice:null};
        if(data.action==='export'&&!await workerAlive(ctx)) throw new Error('Render worker ulanmagan. Sozlamalar bo‘limini ko‘ring.');
        const project=await saveProject(ctx,projectInput,data.id);
        return NextResponse.json(data.action==='save'?{project}:{project,render:await enqueue(ctx,project)});
      }
    }
  } catch(error) {
    const message = error instanceof z.ZodError ? 'Ma’lumot formati noto‘g‘ri. Maydonlarni tekshiring.' : error instanceof Error ? error.message : 'Kutilmagan xatolik.';
    return NextResponse.json({error:message},{status:400});
  }
}
