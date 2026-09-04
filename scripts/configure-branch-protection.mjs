#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const repository = 'founderVSS904/vibeshack-website'
export const protection = {
  required_status_checks: { strict: true, contexts: ['Validate website', 'Vercel'] },
  enforce_admins: true,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: false,
    required_approving_review_count: 0,
  },
  restrictions: null,
  required_conversation_resolution: true,
  allow_force_pushes: false,
  allow_deletions: false,
}

if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify(protection, null, 2))
  console.log('\nReview this policy, then run with --apply using a repository administrator account. The website checks workflow must be available to the pull request before merging.')
} else {
  const details = JSON.parse(execFileSync('gh', ['api', `repos/${repository}`], { encoding: 'utf8' }))
  if (!details.permissions?.admin) {
    console.error('Cannot apply branch protection: the connected GitHub account is not a repository administrator. No settings were changed.')
    process.exitCode = 1
  } else {
    const branch = JSON.parse(execFileSync('gh', ['api', `repos/${repository}/branches/main`], { encoding: 'utf8' }))
    if (branch.protected) {
      throw new Error('Main already has protection. Review its existing rules before changing them; this script will not overwrite a potentially stronger policy.')
    }
    execFileSync('gh', ['api', '--method', 'PUT', `repos/${repository}/branches/main/protection`, '--input', '-'], {
      input: JSON.stringify(protection), stdio: ['pipe', 'ignore', 'inherit'],
    })
    const result = JSON.parse(execFileSync('gh', ['api', `repos/${repository}/branches/main/protection`], { encoding: 'utf8' }))
    const contexts = result.required_status_checks?.contexts || []
    if (!result.enforce_admins?.enabled || !result.required_pull_request_reviews
      || !result.required_status_checks?.strict || !protection.required_status_checks.contexts.every((name) => contexts.includes(name))
      || result.allow_force_pushes?.enabled || result.allow_deletions?.enabled) {
      throw new Error('GitHub returned an unexpected branch policy. Inspect protection before releasing.')
    }
    console.log('Verified main requires a pull request, current-branch checks, Validate website, and Vercel. Force pushes and deletion are disabled; administrators are included.')
  }
}
