#!/usr/bin/env node
/*
 Generates VULNERABILITIES.md from alerts.ndjson and yarn.lock.
 - Parses Dependabot alerts NDJSON (one JSON object per line)
 - Extracts vulnerable ranges and affected package names
 - Parses yarn.lock to gather installed versions per package
 - Compares installed versions against vulnerable ranges
 - Writes a readable markdown summary
*/

const fs = require('fs')
const path = require('path')

const ALERTS_FILE = path.resolve(process.cwd(), 'alerts.ndjson')
const LOCK_FILE = path.resolve(process.cwd(), 'yarn.lock')
const OUTPUT_FILE = path.resolve(process.cwd(), 'VULNERABILITIES.md')

const owner = 'curvefi'
const repo = 'curve-frontend'

function readLines(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean)
}

function parseAlerts(lines) {
  const alerts = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      // Consider only open alerts
      if (obj.state && obj.state !== 'open') continue
      const dep = obj.dependency || {}
      const pkg = (dep.package && dep.package.name) || null
      const manifest = dep.manifest_path || null
      const relation = dep.relationship || null
      const scope = dep.scope || null
      const number = obj.number || null

      // Try both possible locations based on GitHub API docs
      const sv = obj.security_vulnerability || obj.securityVulnerability || null
      const advisory = obj.security_advisory || obj.securityAdvisory || {}
      const summary = advisory.summary || advisory.description?.split('\n')[0] || ''
      const severity = (sv && sv.severity) || advisory.severity || null
      const vulnRange = (sv && sv.vulnerable_version_range) || null
      const patched = (sv && sv.first_patched_version && sv.first_patched_version.identifier) || null

      if (!pkg) continue
      alerts.push({
        number,
        pkg,
        manifest,
        relation,
        scope,
        severity,
        vulnRange,
        patched,
        summary,
        raw: obj,
      })
    } catch (e) {
      // skip lines we cannot parse
    }
  }
  return alerts
}

// Very small semver utilities (support x.y.z only, ignore prerelease/build)
function parseVer(v) {
  if (!v) return null
  const vc = String(v).trim().replace(/^v/, '').split(/[+-]/)[0]
  const m = vc.split('.')
  const [maj, min, pat] = [parseInt(m[0] || '0', 10), parseInt(m[1] || '0', 10), parseInt(m[2] || '0', 10)]
  if ([maj, min, pat].some((n) => Number.isNaN(n))) return null
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
  // comp like: ">= 1.2.3", "<2.0.0", "=1.0.0", "1.2.3"
  comp = comp.trim()
  const m = comp.match(/^(>=|<=|>|<|=)?\s*v?([0-9]+\.[0-9]+\.[0-9]+)\s*$/)
  if (!m) return null // unknown comparator syntax
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
  // GitHub vulnerable_version_range is typically comma-separated AND groups, with optional || between groups
  // Example: ">= 0, < 2.9.13" or ">= 4.0.0, < 4.1.2 || >= 4.2.0, < 4.3.0"
  const groups = String(range)
    .split('||')
    .map((s) => s.trim())
    .filter(Boolean)
  let parsedAny = false
  for (const g of groups) {
    const comps = g
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    let ok = true
    for (const comp of comps) {
      const res = satisfiesSingle(version, comp)
      if (res === null) {
        // unknown comparator
        ok = false
        break
      }
      if (!res) {
        ok = false
        break
      }
      parsedAny = true
    }
    if (ok && parsedAny) return true
  }
  return false
}

function parseYarnLockInstalledVersions(lockContent) {
  // Split records by blank line, find resolution lines like: resolution: "vitest@npm:4.0.6"
  const records = lockContent.split(/\n\n+/)
  const map = new Map() // name -> Set(versions)
  const positions = {} // `${name}@${ver}` -> line number (1-based)

  const lockLines = lockContent.split(/\r?\n/)

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    const resM = rec.match(/resolution:\s+"(.+?)@npm:([^"]+)"/)
    if (!resM) continue
    const name = resM[1]
    const ver = resM[2]
    if (!map.has(name)) map.set(name, new Set())
    map.get(name).add(ver)
    // find the first matching resolution line to anchor a link
    const needle = `resolution: "${name}@npm:${ver}"`
    for (let ln = 0; ln < lockLines.length; ln++) {
      if (lockLines[ln].includes(needle)) {
        positions[`${name}@${ver}`] = ln + 1 // 1-based
        break
      }
    }
  }
  return { versionsMap: map, positions }
}

function getInstalledVersionsFor(pkgName, versionsMap) {
  // versionsMap keys are package names from resolution. For scoped packages, exact match.
  const set = versionsMap.get(pkgName)
  return set ? Array.from(set) : []
}

function checkVersions(alerts, versionsMap) {
  const safe = []
  const vulnerable = []
  for (const a of alerts) {
    const installed = getInstalledVersionsFor(a.pkg, versionsMap)
    let isVulnerable = false
    if (a.vulnRange && installed.length) {
      for (const v of installed) {
        const res = satisfies(v, a.vulnRange)
        if (res === true) {
          isVulnerable = true
          break
        }
      }
    }
    const entry = { ...a, installed, isVuln: isVulnerable }
    if (isVulnerable) vulnerable.push(entry)
    else safe.push(entry)
  }
  return { safe, vulnerable }
}

function writeReport(alerts, versionsMap, positions, commit) {
  const lines = []
  lines.push('**Dependabot Vulnerabilities Overview**')
  lines.push('')
  lines.push('- Source: Dependabot alerts (alerts.ndjson) + local `yarn.lock`')
  lines.push('- Status: ✅ not vulnerable, 🚨 vulnerable')
  lines.push('')
  const pkgs = new Set(alerts.map((a) => a.pkg))
  const detected = Array.from(pkgs).map(
    (p) => `- \`${p}\`: ${getInstalledVersionsFor(p, versionsMap).join(', ') || 'not found'}`,
  )
  if (detected.length) {
    lines.push('**Detected Versions (from yarn.lock)**')
    lines.push(...detected)
    lines.push('')
  }

  // Split into vulnerable vs safe
  const { safe, vulnerable } = checkVersions(alerts, versionsMap)

  function entryLines(a) {
    const sev = a.severity ? a.severity.toUpperCase() : 'UNKNOWN'
    const manifestInfo = a.manifest ? ` • ${a.manifest}` : ''
    const scopeInfo = a.scope
      ? ` • ${a.scope}${a.relation ? ' ' + a.relation : ''}`
      : a.relation
        ? ` • ${a.relation}`
        : ''
    const vulnRangeText = a.vulnRange || 'Range not provided'
    const installedText = a.installed.length ? a.installed.join(', ') : 'not found'
    const patchedText = a.patched ? ` • Patched: ${a.patched}` : ''
    const title = a.summary ? a.summary.replace(/\s+/g, ' ').trim() : ''
    const url = a.raw && a.raw.html_url ? a.raw.html_url : null
    const status = a.isVuln ? '🚨' : '✅'
    const out = []
    out.push(
      `- Dependency: \`${a.pkg}\` | Vulnerable: ${vulnRangeText} | Installed: ${installedText} | Status: ${status}`,
    )
    out.push(`  - Severity: ${sev}${patchedText}`)
    if (title) out.push(`  - Title: ${title}`)
    if (url) out.push(`  - Alert: ${url}`)
    if (manifestInfo || scopeInfo) out.push(`  - Detected in:${manifestInfo}${scopeInfo}`)
    return out
  }

  function fixHint(a) {
    // Provide simple fix guidance
    if (a.patched) return `Update to \`>= ${a.patched}\` (or latest) and re-lock.`
    if (a.vulnRange) {
      // If we have something like "< X", suggest \`>= X\`
      const m = a.vulnRange.match(/<\s*v?([0-9]+\.[0-9]+\.[0-9]+)/)
      if (m) return `Update to \`>= ${m[1]}\` and re-lock.`
    }
    return 'Update to a patched release and re-lock.'
  }

  function proofLinkFor(pkg, installed) {
    // pick first installed version we indexed
    for (const v of installed) {
      const ln = positions[`${pkg}@${v}`]
      if (ln) {
        return `https://github.com/${owner}/${repo}/blob/${commit}/yarn.lock#L${ln}`
      }
    }
    return null
  }

  lines.push('**Vulnerable Alerts (Action Needed)**')
  if (!vulnerable.length) lines.push('- None')
  for (const a of vulnerable) {
    lines.push(...entryLines(a))
    lines.push(`  - Fix: ${fixHint(a)}`)
    lines.push('')
  }

  lines.push('**Safe Alerts (Will Close as Inaccurate)**')
  if (!safe.length) lines.push('- None')
  for (const a of safe) {
    lines.push(...entryLines(a))
    const link = proofLinkFor(a.pkg, a.installed)
    if (link) lines.push(`  - Proof: Installed version is outside vulnerable range → ${link}`)
    lines.push('')
  }

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'))
}

function main() {
  if (!fs.existsSync(ALERTS_FILE)) {
    console.error('alerts.ndjson not found')
    process.exit(1)
  }
  if (!fs.existsSync(LOCK_FILE)) {
    console.error('yarn.lock not found')
    process.exit(1)
  }

  const alerts = parseAlerts(readLines(ALERTS_FILE))
  const lockContent = fs.readFileSync(LOCK_FILE, 'utf8')
  const { versionsMap, positions } = parseYarnLockInstalledVersions(lockContent)
  const commit = require('child_process').execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  writeReport(alerts, versionsMap, positions, commit)
}

main()
