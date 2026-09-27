-- Employee access only. Booking and payment records remain in Calendar/Stripe.
create table if not exists public.employee_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id),
  email text not null unique check (email = lower(trim(email))),
  name text not null check (length(name) between 1 and 120),
  role text not null default 'employee' check (role in ('superadmin', 'employee')),
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  invited_by uuid references auth.users(id),
  invited_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_invited_at timestamptz,
  constraint founder_role check (role <> 'superadmin' or email = 'founder@vibeshackstudios.com')
);
create table if not exists public.employee_activity (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  actor_email text not null,
  action text not null,
  target_email text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.employee_signin_limits (
  email text primary key,
  sent_at timestamptz not null
);
alter table public.employee_members enable row level security;
alter table public.employee_activity enable row level security;
alter table public.employee_signin_limits enable row level security;
-- Browser users have no direct access, including authenticated employees.
revoke all on public.employee_members, public.employee_activity, public.employee_signin_limits from anon, authenticated;
grant all on public.employee_members, public.employee_activity, public.employee_signin_limits to service_role;
grant usage, select on sequence public.employee_activity_id_seq to service_role;

-- Seed only the owner address Tay designated. This is an invitation, not an
-- authenticated account: a verified email/OAuth callback must bind the user ID.
insert into public.employee_members(email,name,role,status)
  values('founder@vibeshackstudios.com','Tay','superadmin','invited')
  on conflict (email) do nothing;

create or replace function public.employee_accept_identity(p_user_id uuid)
returns public.employee_members
language plpgsql security definer set search_path = '' as $$
declare
  identity_email text;
  identity_name text;
  member public.employee_members;
begin
  select lower(email), left(coalesce(nullif(trim(raw_user_meta_data->>'full_name'), ''), 'Tay'), 120)
    into identity_email, identity_name from auth.users
    where id = p_user_id and email_confirmed_at is not null;
  if identity_email is null then raise exception 'Verified identity required'; end if;
  if identity_email = 'founder@vibeshackstudios.com' then
    insert into public.employee_members(user_id,email,name,role,status)
      values(p_user_id,identity_email,identity_name,'superadmin','active')
      on conflict (email) do nothing;
  end if;
  select * into member from public.employee_members where email = identity_email for update;
  if member.id is null or member.status = 'disabled' then raise exception 'Access unavailable'; end if;
  if member.user_id is not null and member.user_id <> p_user_id then raise exception 'Identity mismatch'; end if;
  if member.status = 'invited' or member.user_id is null then
    update public.employee_members set user_id=p_user_id,status='active',updated_at=now()
      where id=member.id returning * into member;
    insert into public.employee_activity(actor_user_id,actor_email,action,target_email)
      values(p_user_id,identity_email,'account.activated',identity_email);
  end if;
  return member;
end;
$$;

create or replace function public.employee_manage_member(
  p_actor uuid, p_action text, p_email text default null, p_name text default null, p_member_id uuid default null
) returns public.employee_members
language plpgsql security definer set search_path = '' as $$
declare
  actor public.employee_members;
  member public.employee_members;
begin
  select * into actor from public.employee_members where user_id=p_actor for update;
  if actor.id is null or actor.role <> 'superadmin' or actor.status <> 'active' then raise exception 'Superadmin required'; end if;
  if p_action not in ('invite','resend','revoke','disable','restore') then raise exception 'Invalid action'; end if;
  if p_action = 'invite' then
    if p_email is null or p_email <> lower(trim(p_email)) or length(p_email)>254 or p_name is null or length(trim(p_name)) not between 1 and 120 then raise exception 'Invalid employee details'; end if;
    if exists(select 1 from public.employee_members where email=p_email) then raise exception 'Account already exists'; end if;
    insert into public.employee_members(email,name,invited_by) values(p_email,trim(p_name),p_actor) returning * into member;
  else
    select * into member from public.employee_members where id=p_member_id for update;
    if member.id is null then raise exception 'Account unavailable'; end if;
  end if;
  if member.role='superadmin' or member.email='founder@vibeshackstudios.com' then raise exception 'Superadmin is protected'; end if;
  if p_action in ('invite','resend') then
    if member.status <> 'invited' then raise exception 'Only pending invitations can be resent'; end if;
    if member.last_invited_at > now()-interval '60 seconds' then raise exception 'Wait a minute before resending'; end if;
    if (select count(*) from public.employee_activity where actor_user_id=p_actor and action in ('team.invite','team.resend') and created_at>now()-interval '1 hour') >=20 then raise exception 'Invitation limit reached'; end if;
    update public.employee_members set last_invited_at=now(),updated_at=now() where id=member.id returning * into member;
  elsif p_action='revoke' then
    if member.status <> 'invited' then raise exception 'Only pending invitations can be revoked'; end if;
    update public.employee_members set status='disabled',updated_at=now() where id=member.id returning * into member;
  elsif p_action='disable' then
    if member.status <> 'active' then raise exception 'Only active employees can be disabled'; end if;
    update public.employee_members set status='disabled',updated_at=now() where id=member.id returning * into member;
  elsif p_action='restore' then
    if member.status <> 'disabled' then raise exception 'Only disabled accounts can be restored'; end if;
    update public.employee_members set status=case when user_id is null then 'invited' else 'active' end,updated_at=now() where id=member.id returning * into member;
  end if;
  insert into public.employee_activity(actor_user_id,actor_email,action,target_email) values(p_actor,actor.email,'team.'||p_action,member.email);
  return member;
end;
$$;

create or replace function public.employee_claim_signin_email(p_email text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare claimed text;
begin
  if not exists(select 1 from public.employee_members where email=p_email and status in ('invited','active')) then return false; end if;
  insert into public.employee_signin_limits(email,sent_at) values(p_email,now())
    on conflict (email) do update set sent_at=excluded.sent_at
    where public.employee_signin_limits.sent_at < now()-interval '60 seconds'
    returning email into claimed;
  return claimed is not null;
end;
$$;

revoke all on function public.employee_accept_identity(uuid) from public, anon, authenticated;
revoke all on function public.employee_manage_member(uuid,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.employee_claim_signin_email(text) from public, anon, authenticated;
grant execute on function public.employee_accept_identity(uuid) to service_role;
grant execute on function public.employee_manage_member(uuid,text,text,text,uuid) to service_role;
grant execute on function public.employee_claim_signin_email(text) to service_role;
