import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let client:SupabaseClient|null=null;
export function browserAuth(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return null;
  return client ||= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export async function authHeaders():Promise<Record<string,string>>{const auth=browserAuth();const session=auth?await auth.auth.getSession():null;return session?.data.session?{Authorization:`Bearer ${session.data.session.access_token}`}:{ };}
export async function api<T=Record<string,unknown>>(body:unknown):Promise<T>{const res=await fetch('/api/studio',{method:'POST',headers:{'Content-Type':'application/json',...await authHeaders()},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error||'So‘rov bajarilmadi.');return data;}
