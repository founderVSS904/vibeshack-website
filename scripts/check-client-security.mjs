import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

// Deliberately bounded: no provider requests, media reads, generic entropy
// heuristics, or secret values in diagnostics. Build-time equality comparisons
// inspect existing private environment values only in memory.
const SOURCE_DIRECTORIES = ['app', 'components', 'lib', 'pages', 'src', 'scripts', 'styles', 'data', 'content', 'public']
const TEXT_EXTENSION = /\.(?:[cm]?[jt]sx?|json|html|css|svg|txt|ya?ml|toml|sql|ini|conf|pem|key|map)$/i
const MODULE_EXTENSION = /\.[cm]?[jt]sx?$/i
const SECRET_ENV = /(?:SECRET|PASSWORD|PRIVATE_KEY|SERVICE_ROLE|ACCESS_TOKEN|REFRESH_TOKEN)/
const PRIVATE_IMPORT = /^(?:server-only|nodemailer|googleapis|stripe|(?:node:)?(?:fs|child_process|net|tls|dns))(?:\/|$)/
const MAX_TEXT_BYTES = 16 * 1024 * 1024
const PATTERNS = [
  ['stripe_secret', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g],
  ['stripe_webhook_secret', /\bwhsec_[A-Za-z0-9]{20,}/g],
  ['supabase_secret', /\bsb_secret_[A-Za-z0-9_-]{16,}/g],
  ['google_oauth_secret', /\bGOCSPX-[A-Za-z0-9_-]{20,}/g],
  ['google_access_token', /\bya29\.[A-Za-z0-9_-]{30,}/g],
  ['google_refresh_token', /\b1\/\/[A-Za-z0-9_-]{50,}/g],
  ['github_token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/g],
  ['npm_token', /\bnpm_[A-Za-z0-9]{30,}/g],
  ['openai_secret', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}/g],
  ['aws_access_key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}/g],
  ['slack_token', /\bxox[baprs]-[A-Za-z0-9-]{20,}/g],
  ['private_key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['credential_url', /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s:/]+:[^\s@]+@/g],
]

function finding(file, text, index, type) {
  return { path: file, line: text.slice(0, index).split('\n').length, type }
}

export function scanCredentialText(file, text) {
  const findings = []
  for (const [type, pattern] of PATTERNS) {
    for (const match of text.matchAll(new RegExp(pattern))) findings.push(finding(file, text, match.index, type))
  }
  // A signed service-role or access JWT is credential material; a publishable
  // legacy Supabase anon JWT is intentionally public and is not a secret.
  for (const match of text.matchAll(/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split('.')[1], 'base64url').toString('utf8'))
      if (payload.role !== 'anon' && (payload.role === 'service_role' || payload.sub || payload.exp)) findings.push(finding(file, text, match.index, 'access_jwt'))
    } catch { /* Arbitrary dotted strings are not credentials. */ }
  }
  return findings
}

function knownSecrets(environment) {
  const candidates = []
  for (const [name, value] of Object.entries(environment)) {
    if (!/SECRET|TOKEN|PASSWORD|PRIVATE_KEY|CREDENTIAL/i.test(name) || (/^(?:NEXT_PUBLIC_|PUBLIC_)/.test(name) && !SECRET_ENV.test(name)) || typeof value !== 'string' || value.length < 8) continue
    const values = new Set([value])
    if (/GCAL_TOKEN_(?:JSON|B64)|CREDENTIAL/i.test(name)) {
      const extract = (entry) => {
        if (!entry || typeof entry !== 'object') return
        for (const [key, child] of Object.entries(entry)) {
          if (/^(?:private_key|client_secret|access_token|refresh_token|password|secret|token)$/i.test(key) && typeof child === 'string' && child.length >= 8) values.add(child)
          else if (child && typeof child === 'object') extract(child)
        }
      }
      for (const candidate of [value, Buffer.from(value, 'base64').toString('utf8')]) {
        try { extract(JSON.parse(candidate)) } catch { /* Only valid credential JSON is expanded. */ }
      }
    }
    const variants = new Set()
    for (const secret of values) {
      variants.add(secret)
      variants.add(JSON.stringify(secret).slice(1, -1))
      variants.add(encodeURIComponent(secret))
      variants.add(secret.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'))
    }
    candidates.push({ name, variants })
  }
  return candidates
}

function matchKnownSecrets(file, text, candidates) {
  const findings = []
  for (const { name, variants } of candidates) {
    const index = [...variants].reduce((first, secret) => {
      const match = text.indexOf(secret)
      return match < 0 ? first : first < 0 ? match : Math.min(first, match)
    }, -1)
    if (index >= 0) findings.push({ ...finding(file, text, index, 'known_server_secret_match'), environment: name })
  }
  return findings
}

export function scanKnownSecretText(file, text, environment) {
  return matchKnownSecrets(file, text, knownSecrets(environment))
}

function isProcessEnv(node) {
  return (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && ts.isIdentifier(node.expression) && node.expression.text === 'process' && (ts.isPropertyAccessExpression(node) ? node.name.text === 'env' : Boolean(node.argumentExpression && ts.isStringLiteral(node.argumentExpression) && node.argumentExpression.text === 'env'))
}

function envAccess(node) {
  if (ts.isPropertyAccessExpression(node) && isProcessEnv(node.expression)) return node.name.text
  if (ts.isElementAccessExpression(node) && isProcessEnv(node.expression)) return node.argumentExpression && ts.isStringLiteral(node.argumentExpression) ? node.argumentExpression.text : '*'
  if (isProcessEnv(node) && !((ts.isPropertyAccessExpression(node.parent) || ts.isElementAccessExpression(node.parent)) && node.parent.expression === node)) return '*'
  return null
}

function publicEnvironment(name) {
  return name === 'NODE_ENV' || (name.startsWith('NEXT_PUBLIC_') && !SECRET_ENV.test(name))
}

function typeOnlyImport(node) {
  const clause = node.importClause
  const bindings = clause?.namedBindings
  return clause?.isTypeOnly || (bindings && ts.isNamedImports(bindings) && !clause.name && bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly))
}

export function scanClientBoundaries(files) {
  const modules = new Map()
  const entries = []
  for (const [file, text] of files) {
    if (!MODULE_EXTENSION.test(file)) continue
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    const imports = []
    const environment = []
    if (ast.statements.some((node) => ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client')) entries.push(file)
    const visit = (node) => {
      let specifier
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && !typeOnlyImport(node)) specifier = node.moduleSpecifier.text
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && !node.isTypeOnly) {
        const bindings = node.exportClause
        if (!(bindings && ts.isNamedExports(bindings) && bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly))) specifier = node.moduleSpecifier.text
      }
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text
      if (specifier) imports.push({ specifier, index: node.getStart(ast) })
      const name = envAccess(node)
      if (name !== null && !publicEnvironment(name)) environment.push(node.getStart(ast))
      ts.forEachChild(node, visit)
    }
    visit(ast)
    modules.set(file, { text, imports, environment })
  }
  const resolve = (from, specifier) => {
    const base = specifier.startsWith('@/') ? specifier.slice(2) : specifier.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier)) : null
    if (!base) return null
    return [base, ...['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'].map((extension) => base + extension)].find((candidate) => modules.has(candidate))
  }
  const visited = new Set()
  const findings = []
  const walk = (file) => {
    if (visited.has(file)) return
    visited.add(file)
    const sourceModule = modules.get(file)
    for (const index of sourceModule.environment) findings.push(finding(file, sourceModule.text, index, 'client_private_environment_access'))
    for (const { specifier, index } of sourceModule.imports) {
      if (PRIVATE_IMPORT.test(specifier)) findings.push(finding(file, sourceModule.text, index, 'client_server_import'))
      const resolved = resolve(file, specifier)
      if (resolved) walk(resolved)
    }
  }
  entries.forEach(walk)
  return { findings, entries: entries.length, reachableModules: visited.size }
}

function walkText(root, directory, files, extension = TEXT_EXTENSION) {
  const absolute = path.join(root, directory)
  if (!existsSync(absolute)) return
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const file = path.posix.join(directory, entry.name)
    if (entry.isDirectory() && !['node_modules', '.git', '.next'].includes(entry.name)) walkText(root, file, files, extension)
    else if (entry.isFile() && (extension.test(entry.name) || privateFilename(file))) files.add(file)
  }
}

function privateFilename(file) {
  const name = path.posix.basename(file)
  return (/^\.env(?:\.|$)/.test(name) && !/^\.env\.(?:example|sample|template)$/.test(name)) || /\.(?:pem|key)$/i.test(name) || /^(?:credentials|service-account|token)\.json$/i.test(name)
}

/** @param {{ root?: string, gitRoot?: string, trackedFiles?: string[], requireBuild?: boolean, environment?: Record<string, string | undefined> }} [options] */
export function auditClientSecurity({ root = process.cwd(), gitRoot = root, trackedFiles, requireBuild = false, environment = process.env } = {}) {
  const findings = []
  let trackedInventory = trackedFiles ? 'provided' : 'git'
  if (!trackedFiles) {
    try { trackedFiles = execFileSync('git', ['-C', gitRoot, 'ls-files', '-z'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).split('\0').filter(Boolean) }
    catch { trackedFiles = []; trackedInventory = 'unavailable' }
  }
  for (const file of trackedFiles) if (privateFilename(file)) findings.push({ path: file, line: 1, type: 'tracked_credential_file' })

  const candidates = new Set()
  for (const directory of SOURCE_DIRECTORIES) walkText(root, directory, candidates)
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && (TEXT_EXTENSION.test(entry.name) || ['.npmrc', '.yarnrc'].includes(entry.name))) candidates.add(entry.name)
  }
  // Sample environment files may be tracked, but their values must stay fake.
  for (const file of trackedFiles) if (/^\.env\.(?:example|sample|template)$/.test(path.posix.basename(file))) candidates.add(file)
  const sourceFiles = new Map()
  for (const file of candidates) {
    const absolute = path.join(root, file)
    if (!existsSync(absolute)) continue
    if (statSync(absolute).size > MAX_TEXT_BYTES) { findings.push({ path: file, line: 1, type: 'text_file_exceeds_scan_limit' }); continue }
    const text = readFileSync(absolute, 'utf8')
    findings.push(...scanCredentialText(file, text))
    if (file.startsWith('public/') && (privateFilename(file) || /\.map$/i.test(file))) findings.push({ path: file, line: 1, type: 'public_private_file' })
    sourceFiles.set(file, text)
  }
  const boundary = scanClientBoundaries(sourceFiles)
  findings.push(...boundary.findings)

  const hasBuild = existsSync(path.join(root, '.next/BUILD_ID'))
  const builtFiles = new Set()
  const htmlFiles = new Set()
  const candidatesForBuild = requireBuild && hasBuild ? knownSecrets(environment) : []
  for (const [file, text] of sourceFiles) if (file.startsWith('public/')) findings.push(...matchKnownSecrets(file, text, candidatesForBuild))
  if (hasBuild) walkText(root, '.next/static', builtFiles)
  else if (requireBuild) findings.push({ path: '.next/BUILD_ID', line: 1, type: 'production_build_required' })
  if (hasBuild && ![...builtFiles].some((file) => /\.js$/.test(file))) findings.push({ path: '.next/static', line: 1, type: 'production_client_assets_missing' })
  if (hasBuild) {
    walkText(root, '.next/server/app', htmlFiles, /\.(?:html|rsc)$/i)
    walkText(root, '.next/server/pages', htmlFiles, /\.(?:html|json)$/i)
  }
  for (const file of builtFiles) {
    const absolute = path.join(root, file)
    if (statSync(absolute).size > MAX_TEXT_BYTES) { findings.push({ path: file, line: 1, type: 'text_file_exceeds_scan_limit' }); continue }
    const text = readFileSync(absolute, 'utf8')
    findings.push(...scanCredentialText(file, text))
    findings.push(...matchKnownSecrets(file, text, candidatesForBuild))
    if (/\.map$/i.test(file) || /sourceMappingURL\s*=\s*data:/.test(text)) findings.push({ path: file, line: 1, type: 'public_source_map' })
  }
  for (const file of htmlFiles) {
    const absolute = path.join(root, file)
    if (statSync(absolute).size > MAX_TEXT_BYTES) { findings.push({ path: file, line: 1, type: 'text_file_exceeds_scan_limit' }); continue }
    const text = readFileSync(absolute, 'utf8')
    findings.push(...scanCredentialText(file, text), ...matchKnownSecrets(file, text, candidatesForBuild))
  }
  return { findings, sourceFiles: sourceFiles.size, builtFiles: builtFiles.size, browserHtmlFiles: htmlFiles.size, knownSecretsChecked: candidatesForBuild.length, clientEntries: boundary.entries, reachableModules: boundary.reachableModules, trackedInventory, productionBuild: hasBuild }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    const value = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined
    const result = auditClientSecurity({ root: value('--root') || process.cwd(), gitRoot: value('--git-root') || value('--root') || process.cwd(), requireBuild: args.includes('--require-build') })
    for (const entry of result.findings) console.error(JSON.stringify(entry))
    console.log(JSON.stringify({ ...result, findings: result.findings.length }))
    if (result.findings.length) process.exitCode = 1
  } catch {
    console.error('Client security scan could not finish. No credential values are included in this diagnostic.')
    process.exitCode = 1
  }
}
