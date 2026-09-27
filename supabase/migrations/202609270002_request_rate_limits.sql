-- Durable abuse controls. Only HMAC identifiers and counters are retained.
-- Keep the original sign-in RPC intact until old deployment traffic drains.
create table if not exists public.request_rate_limits (
  bucket_hash text primary key check (bucket_hash ~ '^[a-f0-9]{64}$'),
  requests integer not null check (requests between 1 and 10001),
  reset_at timestamptz not null
);
create index if not exists request_rate_limits_expiry on public.request_rate_limits(reset_at);
create table if not exists public.employee_recovery_limits (
  subject_hash text primary key check (subject_hash ~ '^[a-f0-9]{64}$'),
  last_sent_at timestamptz not null,
  hour_started_at timestamptz not null,
  hour_requests integer not null check (hour_requests between 1 and 5),
  day_started_at timestamptz not null,
  day_requests integer not null check (day_requests between 1 and 10)
);
alter table public.request_rate_limits enable row level security;
alter table public.employee_recovery_limits enable row level security;
revoke all on public.request_rate_limits, public.employee_recovery_limits from public, anon, authenticated;
grant all on public.request_rate_limits, public.employee_recovery_limits to service_role;

create or replace function public.request_rate_limit_claim(p_bucket_hash text, p_max integer, p_window_ms integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  moment timestamptz := clock_timestamp();
  claimed public.request_rate_limits;
begin
  if p_bucket_hash is null or p_bucket_hash !~ '^[a-f0-9]{64}$' or p_max is null or p_max not between 1 and 10000 or p_window_ms is null or p_window_ms not between 1000 and 86400000 then
    raise exception 'Invalid rate limit';
  end if;
  -- Bounded cleanup prevents unbounded work or cross-request lock contention.
  delete from public.request_rate_limits where bucket_hash in (
    select bucket_hash from public.request_rate_limits where reset_at < moment - interval '1 day'
      order by reset_at limit 100 for update skip locked
  );
  insert into public.request_rate_limits(bucket_hash, requests, reset_at)
    values(p_bucket_hash, 1, moment + p_window_ms * interval '1 millisecond')
    on conflict (bucket_hash) do update set
      requests = case when public.request_rate_limits.reset_at <= moment then 1 else least(public.request_rate_limits.requests + 1, 10001) end,
      reset_at = case when public.request_rate_limits.reset_at <= moment then excluded.reset_at else public.request_rate_limits.reset_at end
    returning * into claimed;
  return jsonb_build_object('allowed', claimed.requests <= p_max,
    'retry_after_seconds', case when claimed.requests <= p_max then 0 else greatest(1, ceil(extract(epoch from claimed.reset_at - moment))::integer) end);
end;
$$;

create or replace function public.employee_claim_recovery_email(p_email text, p_subject_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  moment timestamptz := clock_timestamp();
  claimed text;
begin
  if p_subject_hash is null or p_subject_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid recovery claim'; end if;
  if not exists(select 1 from public.employee_members where email=p_email and status in ('invited','active')) then return false; end if;
  insert into public.employee_recovery_limits(subject_hash,last_sent_at,hour_started_at,hour_requests,day_started_at,day_requests)
    values(p_subject_hash,moment,moment,1,moment,1)
    on conflict (subject_hash) do update set
      last_sent_at=moment,
      hour_started_at=case when public.employee_recovery_limits.hour_started_at <= moment-interval '1 hour' then moment else public.employee_recovery_limits.hour_started_at end,
      hour_requests=case when public.employee_recovery_limits.hour_started_at <= moment-interval '1 hour' then 1 else public.employee_recovery_limits.hour_requests+1 end,
      day_started_at=case when public.employee_recovery_limits.day_started_at <= moment-interval '1 day' then moment else public.employee_recovery_limits.day_started_at end,
      day_requests=case when public.employee_recovery_limits.day_started_at <= moment-interval '1 day' then 1 else public.employee_recovery_limits.day_requests+1 end
    where public.employee_recovery_limits.last_sent_at <= moment-interval '60 seconds'
      and (public.employee_recovery_limits.hour_started_at <= moment-interval '1 hour' or public.employee_recovery_limits.hour_requests < 5)
      and (public.employee_recovery_limits.day_started_at <= moment-interval '1 day' or public.employee_recovery_limits.day_requests < 10)
    returning subject_hash into claimed;
  return claimed is not null;
end;
$$;

-- A zero-write deployment check. These tables and RPCs must remain private.
create or replace function public.request_rate_limit_ready()
returns boolean language sql stable security definer set search_path = '' as $$
  select
    (select count(*)=2 and bool_and(relrowsecurity) from pg_catalog.pg_class where oid in ('public.request_rate_limits'::regclass,'public.employee_recovery_limits'::regclass))
    and not has_table_privilege('anon','public.request_rate_limits','SELECT,INSERT,UPDATE,DELETE')
    and not has_table_privilege('authenticated','public.request_rate_limits','SELECT,INSERT,UPDATE,DELETE')
    and not has_table_privilege('anon','public.employee_recovery_limits','SELECT,INSERT,UPDATE,DELETE')
    and not has_table_privilege('authenticated','public.employee_recovery_limits','SELECT,INSERT,UPDATE,DELETE')
    and has_function_privilege('service_role','public.request_rate_limit_claim(text,integer,integer)','EXECUTE')
    and has_function_privilege('service_role','public.employee_claim_recovery_email(text,text)','EXECUTE')
    and not has_function_privilege('anon','public.request_rate_limit_claim(text,integer,integer)','EXECUTE')
    and not has_function_privilege('authenticated','public.request_rate_limit_claim(text,integer,integer)','EXECUTE')
    and not has_function_privilege('anon','public.employee_claim_recovery_email(text,text)','EXECUTE')
    and not has_function_privilege('authenticated','public.employee_claim_recovery_email(text,text)','EXECUTE');
$$;

revoke all on function public.request_rate_limit_claim(text,integer,integer) from public, anon, authenticated;
revoke all on function public.employee_claim_recovery_email(text,text) from public, anon, authenticated;
revoke all on function public.request_rate_limit_ready() from public, anon, authenticated;
grant execute on function public.request_rate_limit_claim(text,integer,integer) to service_role;
grant execute on function public.employee_claim_recovery_email(text,text) to service_role;
grant execute on function public.request_rate_limit_ready() to service_role;
