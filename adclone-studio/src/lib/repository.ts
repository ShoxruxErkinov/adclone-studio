import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import { type Project, type ProjectInput, type RenderJob } from './model';
import { guardLocal } from './http';
export const configured=()=>!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export type Context={client:SupabaseClient|null;user:{id:string;email:string}|null};
export async function context(request:Request,optional=false):Promise<Context>{
  if(!configured()){
    if(process.env.NODE_ENV==='production'&&process.env.ALLOW_LOCAL_DEMO!=='true')throw new Error('SaaS rejimi uchun Supabase’ni sozlang.');
    guardLocal(request);return {client:null,user:{id:'local-demo',email:'Mahalliy sinov'}};
  }
  const origin=request.headers.get('origin');const allowed=process.env.APP_URL||new URL(request.url).origin;
  if(origin&&origin!==allowed)throw new Error('Begona saytdan so‘rovga ruxsat yo‘q.');
  const authorization=request.headers.get('authorization')||'';
  const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const token=authorization.replace(/^Bearer /,'');
  if(!token){if(optional)return {client,user:null};throw new Error('Davom etish uchun hisobingizga kiring.');}
  const {data,error}=await client.auth.getUser(token);
  if(error||!data.user){if(optional)return {client,user:null};throw new Error('Sessiya tugagan. Qayta kiring.');}
  return {client,user:{id:data.user.id,email:data.user.email||''}};
}
function check(error:{message:string}|null){if(error){console.error('Database operation failed:',error.message);throw new Error('Ma’lumotni saqlash yoki olishda xatolik. Supabase sozlamalarini tekshiring.');}}
export async function consumeQuota(ctx:Context,action:string){if(!ctx.client)return;const {data,error}=await ctx.client.rpc('consume_api_quota',{p_action:action});check(error);if(!data)throw new Error('Bugungi sinov limiti tugadi. Ertaga qayta urinib ko‘ring.');}
export async function listProjects(ctx:Context):Promise<Project[]>{if(!ctx.user)return [];if(!ctx.client)return (await import('./db')).listProjects();const {data,error}=await ctx.client.from('projects').select('*').order('updated_at',{ascending:false});check(error);return (data||[]).map(p=>({...p.body,id:p.id,createdAt:p.created_at,updatedAt:p.updated_at}));}
export async function saveProject(ctx:Context,input:ProjectInput,id?:string):Promise<Project>{
  if(!ctx.client)return (await import('./db')).saveProject(input,id);
  await assertAssets(ctx,input);
  const now=new Date().toISOString();const values={body:input,updated_at:now};
  const query=id?ctx.client.from('projects').update(values).eq('id',id):ctx.client.from('projects').insert({...values,id:randomUUID(),user_id:ctx.user!.id});
  const {data,error}=await query.select().single();check(error);return {...data.body,id:data.id,createdAt:data.created_at,updatedAt:data.updated_at};
}
export async function deleteProject(ctx:Context,id:string){if(!ctx.client)return (await import('./db')).deleteProject(id);const {error}=await ctx.client.from('projects').delete().eq('id',id);check(error);}
export async function listRenders(ctx:Context):Promise<RenderJob[]>{if(!ctx.user)return [];if(!ctx.client)return (await import('./db')).listRenders();const {data,error}=await ctx.client.from('renders').select('id,project_id,project_name,status,progress,error,asset,created_at').order('created_at',{ascending:false}).limit(50);check(error);return (data||[]).map(r=>({id:r.id,projectId:r.project_id,projectName:r.project_name,status:r.status,progress:r.progress,error:r.error,asset:r.asset,createdAt:r.created_at}));}
export async function credits(ctx:Context){if(!ctx.user)return 0;if(!ctx.client)return (await import('./db')).credits();const {data,error}=await ctx.client.from('profiles').select('credits_balance').eq('id',ctx.user.id).single();check(error);return data!.credits_balance as number;}
export async function workerAlive(ctx:Context){if(!ctx.client)return (await import('./db')).workerAlive();const {data,error}=await ctx.client.rpc('worker_available');check(error);return !!data;}
export async function enqueue(ctx:Context,project:Project):Promise<RenderJob>{
  if(!ctx.client)return (await import('./db')).enqueue(project);
  const {id,createdAt:_c,updatedAt:_u,...snapshot}=project;
  const fingerprint=createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
  const {data,error}=await ctx.client.rpc('enqueue_render',{p_project_id:id,p_snapshot:snapshot,p_fingerprint:fingerprint,p_name:project.name});
  if(error)throw new Error(error.message.includes('credits')?'Kredit yetarli emas.':'Eksport navbatga qo‘yilmadi. Qayta urinib ko‘ring.');
  const row=Array.isArray(data)?data[0]:data;return {id:row.id,projectId:row.project_id,projectName:row.project_name,status:row.status,progress:row.progress,error:row.error,asset:row.asset,createdAt:row.created_at};
}
export async function storeAsset(ctx:Context,filename:string,bytes:Buffer,type:string){
  if(!ctx.client){const {writeFile}=await import('node:fs/promises');const {dataDir}=await import('./db');const path=await import('node:path');await writeFile(path.join(dataDir,'assets',filename),bytes);}
  else{const {error}=await ctx.client.storage.from('studio-assets').upload(`${ctx.user!.id}/${filename}`,bytes,{contentType:type,upsert:false});check(error);}
  return `/api/assets/${filename}`;
}
export async function readAsset(ctx:Context,url:string):Promise<Buffer>{
  if(url==='/demo-product.jpg'){const {readFile}=await import('node:fs/promises');const path=await import('node:path');return readFile(path.resolve('public/demo-product.jpg'));}
  const filename=url.split('/').at(-1)!;
  if(!/^[a-f0-9-]+\.(jpg|png|webp|mp3|wav|mp4)$/.test(filename))throw new Error('Fayl manzili noto‘g‘ri.');
  if(!ctx.client){const {readFile}=await import('node:fs/promises');const {dataDir}=await import('./db');const path=await import('node:path');return readFile(path.join(dataDir,'assets',filename));}
  const {data,error}=await ctx.client.storage.from('studio-assets').download(`${ctx.user!.id}/${filename}`);check(error);return Buffer.from(await data!.arrayBuffer());
}
export async function assetUrl(ctx:Context,url:string){if(url==='/demo-product.jpg'||!ctx.client)return url;const filename=url.split('/').at(-1)!;const {data,error}=await ctx.client.storage.from('studio-assets').createSignedUrl(`${ctx.user!.id}/${filename}`,3600);check(error);return data!.signedUrl;}
async function assertAssets(ctx:Context,project:ProjectInput){if(project.product.image!=='/demo-product.jpg')await assetUrl(ctx,project.product.image);if(project.voice)await assetUrl(ctx,project.voice.url);}
