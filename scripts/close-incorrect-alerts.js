#!/usr/bin/env node
/*
 Closes incorrect Dependabot alerts (marked safe in lockfile) with a proof link.

 Usage:
   node scripts/close-incorrect-alerts.js [--apply] [--alerts alerts.ndjson] [--lock yarn.lock]

 Requires:
   - alerts.ndjson (from: gh api repos/curvefi/curve-frontend/dependabot/alerts --paginate --jq '.[] | @json')
   - gh CLI authenticated with scope security_events to PATCH alerts
*/
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')

function argVal(flag, def = null) {
  const i = args.indexOf(flag)
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return def
}

const ALERTS_FILE = path.resolve(process.cwd(), argVal('--alerts', 'alerts.ndjson'))
const LOCK_FILE = path.resolve(process.cwd(), argVal('--lock', 'yarn.lock'))

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
}

function parseAlerts(lines) {
  const alerts = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      if (obj.state && obj.state !== 'open') continue
      const dep = obj.dependency || {}
      const pkg = (dep.package && dep.package.name) || null
      const number = obj.number || null
      const sv = obj.security_vulnerability || obj.securityVulnerability || null
      const advisory = obj.security_advisory || obj.securityAdvisory || {}
      const vulnRange = (sv && sv.vulnerable_version_range) || null
      alerts.push({ number, pkg, vulnRange, raw: obj })
    } catch (_) {}
  }
  return alerts.filter((a) => a.pkg && a.number)
}

function parseYarnLock(lockContent) {
  const records = lockContent.split(/\n\n+/)
  const versions = new Map()
  const positions = {} // key: `${name}@${ver}` -> line
  const lines = lockContent.split(/\r?\n/)
  for (const rec of records) {
    const m = rec.match(/resolution:\s+\"(.+?)@npm:([^\"]+)\"/)
    if (!m) continue
    const name = m[1]
    const ver = m[2]
    if (!versions.has(name)) versions.set(name, new Set())
    versions.get(name).add(ver)
    const needle = `resolution: "${name}@npm:${ver}"`
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) {
        positions[`${name}@${ver}`] = i + 1
        break
      }
    }
  }
  return { versions, positions }
}

function parseVer(v) {
  if (!v) return null
  const vc = String(v).trim().replace(/^v/, '').split(/[+-]/)[0]
  const [maj, min, pat] = vc.split('.').map((x) => parseInt(x || '0', 10))
  if ([maj, min, pat].some(Number.isNaN)) return null
  return { maj, min, pat }
}

function cmp(a, b) {
  const A = parseVer(a),
    B = parseVer(b)
  if (!A || !B) return null
  if (A.maj !== B.maj) return A.maj < B.maj ? -1 : 1
  if (A.min !== B.min) return A.min < B.min ? -1 : 1
  if (A.pat !== B.pat) return A.pat < B.pat ? -1 : 1
  return 0
}

function satisfiesSingle(version, comp) {
  comp = comp.trim()
  const m = comp.match(/^(>=|<=|>|<|=)?\s*v?([0-9]+\.[0-9]+\.[0-9]+)\s*$/)
  if (!m) return null
  const ver = m[2]
  const op = m[1] || '='
  const c = cmp(version, ver)
  if (c === null) return null
  switch (op) {
    case '>':
      return c > 0
    case '>=':
      return c >= 0
    case '<':
      return c < 0
    case '<=':
      return c <= 0
    case '=':
    default:
      return c === 0
  }
}

function satisfies(version, range) {
  if (!range || !version) return false
  const groups = String(range)
    .split('||')
    .map((s) => s.trim())
    .filter(Boolean)
  for (const g of groups) {
    const comps = g
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    let ok = true,
      parsed = false
    for (const c of comps) {
      const r = satisfiesSingle(version, c)
      if (r === null) {
        ok = false
        break
      }
      parsed = true
      if (!r) {
        ok = false
        break
      }
    }
    if (ok && parsed) return true
  }
  return false
}

const owner = 'curvefi'
const repo = 'curve-frontend'

function main() {
  const alerts = parseAlerts(readLines(ALERTS_FILE))
  const lockContent = fs.readFileSync(LOCK_FILE, 'utf8')
  const { versions, positions } = parseYarnLock(lockContent)
  const commit = cp.execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()

  const closable = []
  const keepOpen = []

  for (const a of alerts) {
    const installed = Array.from(versions.get(a.pkg) || [])
    if (!a.vulnRange || installed.length === 0) {
      keepOpen.push({ ...a, reason: 'no range or not installed' })
      continue
    }
    let anyVuln = false
    for (const v of installed) {
      if (satisfies(v, a.vulnRange)) {
        anyVuln = true
        break
      }
    }
    if (!anyVuln) {
      // safe/incorrect
      // choose first installed with known position
      let link = null,
        pick = null
      for (const v of installed) {
        const ln = positions[`${a.pkg}@${v}`]
        if (ln) {
          link = `https://github.com/${owner}/${repo}/blob/${commit}/yarn.lock#L${ln}`
          pick = v
          break
        }
      }
      closable.push({ ...a, installed, link, pick })
    } else {
      keepOpen.push(a)
    }
  }

  console.log(`Would close ${closable.length} alerts as inaccurate; keep open ${keepOpen.length}.`)

  for (const c of closable) {
    const linkTxt = c.link ? ` See yarn.lock for installed ${c.pick}: ${c.link}` : ''
    const msg = `Dismissing as inaccurate: installed version(s) ${c.installed.join(', ')} not in vulnerable range ${c.vulnRange}.${linkTxt}`
    const endpoint = `repos/${owner}/${repo}/dependabot/alerts/${c.number}`
    const call = `gh api -X PATCH ${endpoint} -f state=dismissed -f dismissed_reason=inaccurate -f dismissed_comment=${JSON.stringify(msg)}`
    if (APPLY) {
      try {
        cp.execSync(call, { stdio: 'inherit' })
      } catch (e) {
        console.error(`Failed to close #${c.number}:`, e.message)
      }
    } else {
      console.log(call)
    }
  }
}

main()
