import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { configured } from '@/lib/repository';
import { guardLocal } from '@/lib/http';
export const runtime='nodejs';
export async function GET(request: Request, context:{params:Promise<{filename:string}>}){
  try{
    if(configured()||process.env.NODE_ENV==='production'&&process.env.ALLOW_LOCAL_DEMO!=='true')return new Response('Not found',{status:404});
    guardLocal(request);const {dataDir}=await import('@/lib/db');const {filename}=await context.params;
    if(!/^[a-f0-9-]+\.(jpg|png|webp|mp3|wav|mp4)$/.test(filename))return new Response('Not found',{status:404});
    const bytes=await readFile(path.join(dataDir,'assets',filename));const ext=filename.split('.').at(-1)!;
    const types:Record<string,string>={jpg:'image/jpeg',png:'image/png',webp:'image/webp',mp3:'audio/mpeg',wav:'audio/wav',mp4:'video/mp4'};
    const headers:Record<string,string>={'Content-Type':types[ext],'Cache-Control':'private, max-age=31536000, immutable','Accept-Ranges':'bytes'};
    if(new URL(request.url).searchParams.has('download'))headers['Content-Disposition']=`attachment; filename="adclone-${filename}"`;
    const range=request.headers.get('range');
    if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match)return new Response(null,{status:416});const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):bytes.length-1,bytes.length-1);if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.length}`}});headers['Content-Range']=`bytes ${start}-${end}/${bytes.length}`;headers['Content-Length']=String(end-start+1);return new Response(bytes.subarray(start,end+1),{status:206,headers});}
    headers['Content-Length']=String(bytes.length);return new Response(bytes,{headers});
  }catch{return new Response('Not found',{status:404});}
}
