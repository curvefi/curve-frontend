#!/usr/bin/env node
import { execSync } from 'child_process'

const MAX_AGE_DAYS = 3
const DAY_MS = 24 * 60 * 60 * 1000
const MAX_AGE_MS = MAX_AGE_DAYS * DAY_MS
const ALLOWED_SCOPES = ['@curvefi']
const BASE = 'origin/main'

/** Fetches the publish date of a specific package version from the npm registry. */
async function getPublishTime(name, version) {
  const response = await fetch(`https://registry.npmjs.org/${name}`)
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${name}`)
  const { time } = await response.json()
  if (!time?.[version]) throw new Error(`No publish time found for ${name}@${version}`)
  return new Date(time[version])
}

/** Parses yarn.lock diff against origin/main and returns all newly added npm package resolutions, excluding allowed scopes. */
function getAddedPackages(base) {
  const diff = execSync(`git diff ${base} HEAD -- yarn.lock`, { encoding: 'utf8' })
  const matches = [...diff.matchAll(/^\+\s+resolution: "(.+)@npm:([^"]+)"$/gm)]
  return [...new Map(matches.map(([, name, version]) => [`${name}@${version}`, { name, version }])).values()]
}

/** Checks a single package's publish age and logs the result. */
async function checkPackage({ name, version }) {
  const publishTime = await getPublishTime(name, version)
  const ageMs = Date.now() - publishTime.getTime()
  const ageDays = ageMs / DAY_MS
  const isForbidden = ageMs < MAX_AGE_MS && !ALLOWED_SCOPES.some((scope) => name.startsWith(`${scope}/`))
  if (isForbidden) {
    console.info(`  ✗ ${name}@${version} — published ${ageDays.toFixed(1)}d ago`)
  } else {
    console.info(`  ✓ ${name}@${version} — ${ageDays.toFixed(0)}d old`)
  }
  return { name, version, ageDays, isForbidden }
}

/** Main function to check all newly added packages in yarn.lock against npm publish dates. */
async function main() {
  const packages = getAddedPackages(BASE)
  if (!packages.length) {
    return console.info(`No new packages added to yarn.lock since ${BASE}. ✓`)
  }

  console.info(`Checking ${packages.length} newly added package(s) against npm publish dates...\n`)
  const results = await Promise.all(packages.map(checkPackage))
  const forbidden = results.filter((r) => r.isForbidden)
  if (!forbidden.length) {
    return console.info(`\n✓ All ${packages.length} changed package(s) are at least ${MAX_AGE_DAYS} days old.`)
  }

  throw new Error(
    [
      `❌ ${forbidden.length} package(s) published less than ${MAX_AGE_DAYS} days ago:`,
      forbidden.map(({ name, version, ageDays }) => `  ${name}@${version} (${ageDays.toFixed(1)}d old)`).join('\n'),
      ``,
      `Wait until they are at least ${MAX_AGE_DAYS} days old before merging.`,
    ].join('\n'),
  )
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
