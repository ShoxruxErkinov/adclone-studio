import { existsSync, mkdirSync, readFileSync, openSync, closeSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { claimJob, complete, fail, heartbeat, progress, recover, remoteAsset, type Job } from '../src/lib/worker-store';
import {projectInputSchema,scriptText,type VideoProps} from '../src/lib/model';
for(const file of ['.env.local','.env'])if(existsSync(file))process.loadEnvFile(file);
const dataDir=path.resolve(process.env.ADCLONE_DATA_DIR||'.data');mkdirSync(path.join(dataDir,'assets'),{recursive:true});
const lock=path.join(dataDir,'worker.lock');
try{const fd=openSync(lock,'wx');writeFileSync(fd,String(process.pid));closeSync(fd);}catch{
  const pid=Number(readFileSync(lock,'utf8'));let alive=false;try{process.kill(pid,0);alive=true;}catch{}
  if(alive){console.error('A render worker is already active.');process.exit(1);}unlinkSync(lock);writeFileSync(lock,String(process.pid));
}
function cleanup(){try{unlinkSync(lock);}catch{}}
process.on('exit',cleanup);process.on('SIGINT',()=>process.exit());process.on('SIGTERM',()=>process.exit());
await recover();await heartbeat();const timer=setInterval(()=>{void heartbeat().catch(e=>console.error('Worker heartbeat failed:',e.message));},5000);
let serveUrl:string|undefined;
const chrome=process.env.CHROME_EXECUTABLE||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/chromium','/usr/bin/google-chrome'].find(existsSync);
async function asDataUrl(job:Job,url:string){const remote=await remoteAsset(job,url);const file=url==='/demo-product.jpg'?path.resolve('public/demo-product.jpg'):path.join(dataDir,'assets',path.basename(url));const ext=path.extname(file);const mime:Record<string,string>={'.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav'};return `data:${mime[ext]};base64,${(remote||readFileSync(file)).toString('base64')}`;}
console.log('AdClone render worker ready.');
async function tick(){
  const job=await claimJob();if(!job)return;
  try{
    job.snapshot=projectInputSchema.parse(job.snapshot);
    if(job.snapshot.voice?.text!==scriptText(job.snapshot))job.snapshot.voice=null;
    await progress(job,1);
    if(!serveUrl){mkdirSync(path.join(dataDir,'bundle'),{recursive:true});serveUrl=await bundle({entryPoint:path.resolve('src/video/index.tsx'),outDir:path.join(dataDir,'bundle'),publicDir:path.resolve('public')});}
    const inputProps:VideoProps={project:job.snapshot,imageSrc:await asDataUrl(job,job.snapshot.product.image),...(job.snapshot.voice?{voiceSrc:await asDataUrl(job,job.snapshot.voice.url)}:{})};
    const composition=await selectComposition({serveUrl,id:'AdClone',inputProps,browserExecutable:chrome});
    let last=0;
    await renderMedia({composition,serveUrl,codec:'h264',inputProps,outputLocation:path.join(dataDir,'assets',`${job.id}.mp4`),browserExecutable:chrome,concurrency:Math.min(4,Math.max(1,Number(process.env.RENDER_CONCURRENCY)||2)),crf:21,pixelFormat:'yuv420p',onProgress:({progress:value})=>{const p=Math.floor(value*98)+1;if(p>last+2){void progress(job,p).catch(e=>console.error(e.message));last=p;}}});
    await complete(job,`${job.id}.mp4`,readFileSync(path.join(dataDir,'assets',`${job.id}.mp4`)));console.log(`Completed render ${job.id}`);
  }catch(e){console.error('Render failed:',e);await fail(job,'Video yig‘ilmadi. Kredit qaytarildi. Worker jurnalini tekshirib, qayta urinib ko‘ring.');}
}
while(true){try{await tick();}catch(e){console.error('Worker queue unavailable:',e);}await new Promise(r=>setTimeout(r,1500));}
clearInterval(timer);
