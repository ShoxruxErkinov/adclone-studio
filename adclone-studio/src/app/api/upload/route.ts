import { NextResponse } from 'next/server';
import { limitedBody } from '@/lib/http';
import { context,consumeQuota } from '@/lib/repository';
import { storeImage } from '@/lib/providers';
export const runtime='nodejs';
export async function POST(request: Request){
  try{const ctx=await context(request);await consumeQuota(ctx,'upload');const body=await limitedBody(request,4000000);const form=await new Response(body,{headers:{'content-type':request.headers.get('content-type')||''}}).formData();const file=form.get('file');if(!(file instanceof File))throw new Error('Rasm tanlang.');return NextResponse.json({image:await storeImage(Buffer.from(await file.arrayBuffer()),ctx)});}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Rasm yuklanmadi.'},{status:400});}
}
