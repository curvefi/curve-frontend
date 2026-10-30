/** Vibe coded script to batch delete all Tenderly vnets, as their UI doesn't give the option to do so. */

import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'

async function promptAccount() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Run this script in an interactive terminal.')
  }

  let hidden = false
  const output = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      if (!hidden) process.stdout.write(chunk)
      callback()
    },
  })
  const input = createInterface({ input: process.stdin, output, terminal: true, historySize: 0 })
  const controller = new AbortController()
  input.once('close', () => controller.abort())

  async function question(label: string, secret = false) {
    hidden = secret
    const prompt = `${label}: `
    if (secret) process.stdout.write(prompt)
    const value = (await input.question(secret ? '' : prompt, { signal: controller.signal })).trim()
    if (secret) process.stdout.write('\n')
    if (!value) throw new Error(`${label} is required.`)
    return value
  }

  try {
    const accountSlug = await question('Tenderly account slug')
    const projectSlug = await question('Tenderly project slug')
    const accessKey = await question('Tenderly API key', true)
    return { accountSlug, projectSlug, accessKey }
  } catch (error) {
    if (controller.signal.aborted) {
      process.stdout.write('\n')
      throw new Error('Input cancelled.', { cause: error })
    }
    throw error
  } finally {
    input.close()
    output.destroy()
  }
}

function parseEnvironmentIds(body: unknown) {
  if (!Array.isArray(body)) throw new Error('Invalid environment list: expected an array.')
  return body.map((environment: unknown) => {
    if (
      typeof environment !== 'object' ||
      environment === null ||
      !('id' in environment) ||
      typeof environment.id !== 'string' ||
      !environment.id.trim()
    ) {
      throw new Error('Invalid environment list: every entry must have a nonempty string id.')
    }
    return environment.id
  })
}

async function cleanup() {
  const { accountSlug, projectSlug, accessKey } = await promptAccount()
  const url = `https://api.tenderly.co/api/public/v1/account/${encodeURIComponent(accountSlug)}/project/${encodeURIComponent(projectSlug)}/environments`
  const deleted = new Set<string>()

  async function request(method: 'GET' | 'DELETE', environmentIds?: string[]) {
    const response = await fetch(url, {
      method,
      headers: { 'X-Access-Key': accessKey, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: environmentIds ? JSON.stringify({ environment_ids: environmentIds }) : undefined,
      signal: AbortSignal.timeout(30_000),
    }).catch(() => {
      throw new Error(`${method} ${url} failed (network error or 30-second timeout).`)
    })
    if (!response.ok) throw new Error(`${method} ${url} failed: HTTP ${response.status}.`)
    return response
  }

  console.info(`Deleting all environments in ${accountSlug}/${projectSlug}...`)
  try {
    while (true) {
      const response = await request('GET')
      const body: unknown = await response.json().catch(() => {
        throw new Error('Could not read the environment list as JSON (invalid response or timeout).')
      })
      const ids = [...new Set(parseEnvironmentIds(body))]
      if (ids.length === 0) {
        console.info('No environments remain.')
        return
      }
      const repeatedId = ids.find(id => deleted.has(id))
      if (repeatedId) throw new Error(`Previously deleted environment '${repeatedId}' reappeared; stopping.`)

      // Re-fetch the first batch after deletion so shifting pages cannot skip environments.
      const result = await request('DELETE', ids)
      await result.body?.cancel()
      for (const id of ids) {
        deleted.add(id)
      }
      console.info(`Deleted ${ids.length} environments (${deleted.size} total).`)
    }
  } finally {
    console.info(`Deleted ${deleted.size} environment(s) in ${accountSlug}/${projectSlug}.`)
  }
}

/**
 * Run with Node 24: node tests/scripts/cleanup-tenderly-vnets.ts
 * Pause environment creation first; this script batch-deletes environments until the project is empty.
 * @see https://docs.tenderly.co/api-reference/virtual-environments/batch-delete-environments
 */
cleanup().catch(error => {
  console.error(error instanceof Error ? error.message : 'Tenderly cleanup failed.')
  process.exitCode = 1
})
