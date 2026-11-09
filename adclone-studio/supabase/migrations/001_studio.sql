-- Apply once in Supabase SQL Editor. All customer-facing tables use RLS.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  credits_balance integer not null default 3 check (credits_balance >= 0),
  created_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  body jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint bounded_project check (octet_length(body::text) <= 100000)
);
create index projects_owner on public.projects(user_id,updated_at desc);
create table public.renders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null, project_name text not null, snapshot jsonb not null, fingerprint text not null,
  status text not null default 'queued' check (status in ('queued','rendering','completed','failed')),
  progress integer not null default 0 check (progress between 0 and 100), error text, asset text,
  lease_token uuid, lease_expires_at timestamptz, created_at timestamptz not null default now()
);
create index render_queue on public.renders(status,created_at);
create unique index one_active_render on public.renders(user_id,project_id,fingerprint) where status in ('queued','rendering');
create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  render_id uuid not null references public.renders(id) on delete cascade,
  kind text not null check(kind in ('reserve','refund')), amount integer not null,
  created_at timestamptz not null default now(), unique(render_id,kind)
);
create table public.worker_heartbeat(id integer primary key check(id=1), updated_at timestamptz not null);
create table public.api_quota(user_id uuid references auth.users(id) on delete cascade, action text not null, day date not null, count integer not null, primary key(user_id,action,day));
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.renders enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.worker_heartbeat enable row level security;
alter table public.api_quota enable row level security;
create policy own_profile on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy own_projects on public.projects for all to authenticated using (user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy own_renders on public.renders for select to authenticated using(user_id=(select auth.uid()));
create policy own_ledger on public.credit_ledger for select to authenticated using(user_id=(select auth.uid()));
revoke all on public.profiles,public.projects,public.renders,public.credit_ledger,public.worker_heartbeat,public.api_quota from anon,authenticated;
grant select on public.profiles,public.renders,public.credit_ledger to authenticated;
grant select,insert,update,delete on public.projects to authenticated;
grant all on public.profiles,public.projects,public.renders,public.credit_ledger,public.worker_heartbeat,public.api_quota to service_role;

create function public.create_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
-- Backfill pre-existing users when installing on an existing Supabase project.
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;

create function public.enqueue_render(p_project_id uuid,p_snapshot jsonb,p_fingerprint text,p_name text) returns public.renders
language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid(); job public.renders; balance integer;
begin
  if actor is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from public.projects where id=p_project_id and user_id=actor) then raise exception 'project not found'; end if;
  if octet_length(p_snapshot::text)>100000 or length(p_name)>100 or length(p_fingerprint)>128 then raise exception 'invalid input'; end if;
  select credits_balance into balance from public.profiles where id=actor for update;
  select * into job from public.renders where user_id=actor and project_id=p_project_id and fingerprint=p_fingerprint and status in ('queued','rendering');
  if found then return job; end if;
  if balance is null or balance<1 then raise exception 'insufficient credits'; end if;
  insert into public.renders(user_id,project_id,project_name,snapshot,fingerprint) values(actor,p_project_id,p_name,p_snapshot,p_fingerprint) returning * into job;
  update public.profiles set credits_balance=credits_balance-1 where id=actor;
  insert into public.credit_ledger(user_id,render_id,kind,amount) values(actor,job.id,'reserve',-1);
  return job;
end $$;

create function public.fail_render(p_id uuid,p_lease uuid,p_error text) returns void
language plpgsql security definer set search_path=public as $$
declare job public.renders;
begin
  select * into job from public.renders where id=p_id for update;
  if not found or job.status<>'rendering' or job.lease_token is distinct from p_lease then return; end if;
  update public.renders set status='failed',error=left(p_error,500),lease_expires_at=null where id=p_id;
  insert into public.credit_ledger(user_id,render_id,kind,amount) values(job.user_id,job.id,'refund',1) on conflict(render_id,kind) do nothing;
  if found then update public.profiles set credits_balance=credits_balance+1 where id=job.user_id; end if;
end $$;
create function public.claim_render() returns setof public.renders
language plpgsql security definer set search_path=public as $$
declare job public.renders; stale public.renders;
begin
  for stale in select * from public.renders where status='rendering' and lease_expires_at<now() for update skip locked loop
    perform public.fail_render(stale.id,stale.lease_token,'Worker bilan aloqa uzildi. Kredit qaytarildi; qayta eksport qiling.');
  end loop;
  select * into job from public.renders where status='queued' order by created_at for update skip locked limit 1;
  if not found then return; end if;
  return query update public.renders set status='rendering',lease_token=gen_random_uuid(),lease_expires_at=now()+interval '10 minutes' where id=job.id returning *;
end $$;
create function public.update_render_progress(p_id uuid,p_lease uuid,p_progress integer) returns void
language sql security definer set search_path=public as $$
  update public.renders set progress=greatest(0,least(99,p_progress)),lease_expires_at=now()+interval '10 minutes'
  where id=p_id and lease_token=p_lease and status='rendering';
$$;
create function public.complete_render(p_id uuid,p_lease uuid,p_asset text) returns void
language sql security definer set search_path=public as $$
  update public.renders set status='completed',progress=100,asset=p_asset,lease_expires_at=null where id=p_id and lease_token=p_lease and status='rendering';
$$;
create function public.mark_worker() returns void language sql security definer set search_path=public as $$
  insert into public.worker_heartbeat values(1,now()) on conflict(id) do update set updated_at=excluded.updated_at;
$$;
create function public.worker_available() returns boolean language sql security definer set search_path=public as $$
  select coalesce((select updated_at>now()-interval '30 seconds' from public.worker_heartbeat where id=1),false);
$$;
create function public.consume_api_quota(p_action text) returns boolean language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid(); daily_limit integer; used integer;
begin
  if actor is null then return false; end if;
  daily_limit:=case p_action when 'script' then 50 when 'import' then 50 when 'voice' then 10 when 'background' then 10 when 'upload' then 30 else 0 end;
  if daily_limit=0 then return false; end if;
  insert into public.api_quota values(actor,p_action,current_date,1) on conflict(user_id,action,day) do update set count=public.api_quota.count+1 returning count into used;
  return used<=daily_limit;
end $$;

-- Functions are executable by PUBLIC by default in Postgres. Revoke explicitly.
revoke all on function public.create_profile(),public.enqueue_render(uuid,jsonb,text,text),public.fail_render(uuid,uuid,text),public.claim_render(),public.update_render_progress(uuid,uuid,integer),public.complete_render(uuid,uuid,text),public.mark_worker(),public.worker_available(),public.consume_api_quota(text) from public,anon,authenticated;
grant execute on function public.enqueue_render(uuid,jsonb,text,text),public.worker_available(),public.consume_api_quota(text) to authenticated;
grant execute on function public.fail_render(uuid,uuid,text),public.claim_render(),public.update_render_progress(uuid,uuid,integer),public.complete_render(uuid,uuid,text),public.mark_worker(),public.worker_available() to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-assets','studio-assets',false,104857600,array['image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','video/mp4']) on conflict(id) do nothing;
create policy studio_assets_read on storage.objects for select to authenticated using(bucket_id='studio-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy studio_assets_insert on storage.objects for insert to authenticated with check(bucket_id='studio-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy studio_assets_delete on storage.objects for delete to authenticated using(bucket_id='studio-assets' and (storage.foldername(name))[1]=(select auth.uid())::text);
