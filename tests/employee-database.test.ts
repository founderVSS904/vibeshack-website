import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { PGlite } from '@electric-sql/pglite'

// Execute the actual migration against isolated PostgreSQL, with synthetic Auth
// identities. No credentials, Supabase project, or network access is required.
const db = new PGlite()
const owner = '10000000-0000-4000-8000-000000000001'
const staff = '20000000-0000-4000-8000-000000000002'
const stranger = '30000000-0000-4000-8000-000000000003'
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb default '{}');`)
  await db.exec(readFileSync('supabase/migrations/202609270001_employee_accounts.sql', 'utf8'))
  await db.query(`insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
    ($1,'founder@vibeshackstudios.com',now(),'{"full_name":"Fixture Owner"}'),
    ($2,'employee@example.test',now(),'{"role":"superadmin"}'),
    ($3,'outsider@example.test',now(),'{}')`, [owner, staff, stranger])
})
after(async () => { await db.close() })

test('only the exact confirmed founder identity can bootstrap Superadmin', async () => {
  await assert.rejects(db.query('select public.employee_accept_identity($1)', [stranger]), /Access unavailable/)
  const result = await db.query<{ role: string; user_id: string }>('select * from public.employee_accept_identity($1)', [owner])
  assert.equal(result.rows[0].role, 'superadmin')
  assert.equal(result.rows[0].user_id, owner)
  await db.query(`insert into auth.users(id,email) values('40000000-0000-4000-8000-000000000004','unverified@example.test')`)
  await assert.rejects(db.query(`select public.employee_accept_identity('40000000-0000-4000-8000-000000000004')`), /Verified identity required/)
})

test('invitation binds a verified identity and cannot inherit a user-controlled admin role', async () => {
  await assert.rejects(db.query(`select public.employee_manage_member($1,'invite','rogue@example.test','Fixture')`, [stranger]), /Superadmin required/)
  const invited = await db.query<{ status: string; user_id: string | null }>(`select * from public.employee_manage_member($1,'invite','employee@example.test','Fixture Employee')`, [owner])
  assert.equal(invited.rows[0].status, 'invited')
  assert.equal(invited.rows[0].user_id, null)
  const accepted = await db.query<{ status: string; role: string; user_id: string }>('select * from public.employee_accept_identity($1)', [staff])
  assert.equal(accepted.rows[0].status, 'active')
  assert.equal(accepted.rows[0].role, 'employee')
  assert.equal(accepted.rows[0].user_id, staff)
  await assert.rejects(db.query(`select public.employee_manage_member($1,'invite','second@example.test','Fixture')`, [staff]), /Superadmin required/)
})

test('disable blocks reacceptance and email links until explicitly restored', async () => {
  const row = await db.query<{ id: string }>('select id from public.employee_members where user_id=$1', [staff])
  const member = row.rows[0].id
  await db.query(`select public.employee_manage_member($1,'disable',null,null,$2)`, [owner, member])
  await assert.rejects(db.query('select public.employee_accept_identity($1)', [staff]), /Access unavailable/)
  const blocked = await db.query<{ allowed: boolean }>(`select public.employee_claim_signin_email('employee@example.test') as allowed`)
  assert.equal(blocked.rows[0].allowed, false)
  await db.query(`select public.employee_manage_member($1,'restore',null,null,$2)`, [owner, member])
  const restored = await db.query<{ user_id: string; status: string }>('select * from public.employee_accept_identity($1)', [staff])
  assert.equal(restored.rows[0].user_id, staff)
  assert.equal(restored.rows[0].status, 'active')
})

test('Superadmin cannot be disabled and roles cannot be assigned by invitation input', async () => {
  const row = await db.query<{ id: string }>('select id from public.employee_members where user_id=$1', [owner])
  await assert.rejects(db.query(`select public.employee_manage_member($1,'disable',null,null,$2)`, [owner, row.rows[0].id]), /Superadmin is protected/)
  await assert.rejects(db.query(`select public.employee_manage_member($1,'promote',null,null,$2)`, [owner, row.rows[0].id]), /Invalid action/)
  await assert.rejects(db.query(`update public.employee_members set role='superadmin' where user_id=$1`, [staff]), /founder_role/)
})

test('sign-in delivery has a durable per-recipient throttle and rejects unknown accounts', async () => {
  const a = await db.query<{ allowed: boolean }>(`select public.employee_claim_signin_email('employee@example.test') as allowed`)
  const b = await db.query<{ allowed: boolean }>(`select public.employee_claim_signin_email('employee@example.test') as allowed`)
  const c = await db.query<{ allowed: boolean }>(`select public.employee_claim_signin_email('unknown@example.test') as allowed`)
  assert.equal(a.rows[0].allowed, true)
  assert.equal(b.rows[0].allowed, false)
  assert.equal(c.rows[0].allowed, false)
})

test('revoked pending invitations cannot activate, and immediate resend is blocked', async () => {
  const pending = await db.query<{ id: string }>(`select * from public.employee_manage_member($1,'invite','pending@example.test','Pending Fixture')`, [owner])
  const id = pending.rows[0].id
  await assert.rejects(db.query(`select public.employee_manage_member($1,'resend',null,null,$2)`, [owner, id]), /Wait a minute/)
  await db.query(`select public.employee_manage_member($1,'revoke',null,null,$2)`, [owner, id])
  await db.query(`insert into auth.users(id,email,email_confirmed_at) values('50000000-0000-4000-8000-000000000005','pending@example.test',now())`)
  await assert.rejects(db.query(`select public.employee_accept_identity('50000000-0000-4000-8000-000000000005')`), /Access unavailable/)
  await assert.rejects(db.query(`select public.employee_manage_member($1,'resend',null,null,$2)`, [owner, id]), /Only pending/)
})

test('browser database roles cannot read staff records or call privileged account functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    try {
      await assert.rejects(db.query('select * from public.employee_members'), /permission denied/)
      await assert.rejects(db.query('select * from public.employee_activity'), /permission denied/)
      await assert.rejects(db.query('select public.employee_accept_identity($1)', [owner]), /permission denied/)
      await assert.rejects(db.query(`select public.employee_manage_member($1,'invite','bad@example.test','Bad')`, [owner]), /permission denied/)
    } finally { await db.exec('reset role') }
  }
})
