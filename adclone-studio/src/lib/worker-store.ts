import {createClient} from '@supabase/supabase-js';
import {type ProjectInput} from './model';
export type Job={id:string;snapshot:ProjectInput;userId?:string;lease?:string};
const remote=!!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);
const client=remote?createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}}):null;
async function rpc(name:string,args?:Record<string,unknown>){const {data,error}=await client!.rpc(name,args);if(error)throw new Error(`Worker database: ${error.message}`);return data;}
export async function recover(){if(!client)(await import('./db')).recoverInterrupted();}
export async function heartbeat(){if(client)await rpc('mark_worker');else (await import('./db')).heartbeat();}
export async function claimJob():Promise<Job|null>{if(!client)return (await import('./db')).claimJob();const rows=await rpc('claim_render');const r=rows?.[0];return r?{id:r.id,snapshot:r.snapshot,userId:r.user_id,lease:r.lease_token}:null;}
export async function progress(job:Job,value:number){if(client)await rpc('update_render_progress',{p_id:job.id,p_lease:job.lease,p_progress:value});else (await import('./db')).progress(job.id,value);}
export async function complete(job:Job,filename:string,bytes:Buffer){if(client){const {error}=await client.storage.from('studio-assets').upload(`${job.userId}/${filename}`,bytes,{contentType:'video/mp4',upsert:false});if(error)throw error;await rpc('complete_render',{p_id:job.id,p_lease:job.lease,p_asset:filename});}else (await import('./db')).complete(job.id,filename);}
export async function fail(job:Job,message:string){if(client)await rpc('fail_render',{p_id:job.id,p_lease:job.lease,p_error:message});else (await import('./db')).fail(job.id,message);}
export async function remoteAsset(job:Job,url:string):Promise<Buffer|null>{if(!client||url==='/demo-product.jpg')return null;const {data,error}=await client.storage.from('studio-assets').download(`${job.userId}/${url.split('/').at(-1)}`);if(error)throw error;return Buffer.from(await data!.arrayBuffer());}
