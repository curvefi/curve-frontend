import { execFileSync, type ExecFileSyncOptionsWithStringEncoding, spawnSync } from 'child_process'
import { mkdir, readdir, rmdir, unlink } from 'fs/promises'
import { dirname, join } from 'path'
import { join as joinPath } from 'path'

const { BRANCH, WORKFLOW, REPOSITORY = 'curvefi/curve-frontend' } = process.env
const DEST_DIR = 'artifacts'

/**
 * Execute a command and return trimmed stdout.
 */
const run = (command: string, args: string[], options?: ExecFileSyncOptionsWithStringEncoding): string =>
  execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    ...options,
  }).trim()

/**
 * Stream a command to the terminal, throwing on failure.
 */
function runStreaming(command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}`)
  }
}

const hasCommand = (command: string) => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0

/**
 * Find the latest workflow run id for a branch and workflow.
 */
const findLatestRunId = (branch: string, workflow: string): string =>
  run('gh', [
    'run',
    'list',
    '--repo',
    REPOSITORY,
    '--branch',
    branch,
    '--workflow',
    workflow,
    '--limit',
    '1',
    '--json',
    'databaseId',
    '--jq',
    '.[0].databaseId',
  ])

/**
 * Download artifacts for the given run into dest.
 */
const downloadArtifacts = (runId: string, dest: string) => {
  runStreaming('gh', ['run', 'download', runId, '--repo', REPOSITORY, '--dir', dest])
}

/**
 * Check if a directory contains any .png files (indicating test failures).
 */
async function hasScreenshots(dir: string): Promise<boolean> {
  const entries = await readdir(dir, { withFileTypes: true }).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined // missing directory, so no screenshots
    throw error
  })
  if (!entries) return false // does not exist
  if (entries.length === 0) {
    console.info(`Removing empty screenshot directory: ${dir}`)
    await rmdir(dir)
    return false
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (await hasScreenshots(fullPath)) {
        return true
      }
    } else if (entry.name.endsWith('.png')) {
      console.info(`Found screenshot file ${entry.name}`)
      return true
    }
  }
  return false
}

/**
 * Recursively find and delete videos from successful tests (those without matching screenshots).
 */
async function cleanupSuccessfulTestVideos(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries ?? []) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await cleanupSuccessfulTestVideos(fullPath)
    } else if (entry.name.endsWith('.mp4')) {
      // For a video file like "test.cy.ts.mp4", check if "test.cy.ts/" directory has screenshots
      const videoBaseName = entry.name.slice(0, -4) // Remove .mp4 extension
      const screenshotDir = join(dirname(fullPath), videoBaseName)
      if (!(await hasScreenshots(screenshotDir))) {
        await unlink(fullPath)
      }
    }
  }
}

/**
 * Orchestrate download + extraction of the latest workflow artifacts for the current branch.
 */
async function downloadLatestArtifacts({ cleanup }: { cleanup: boolean }): Promise<void> {
  if (!hasCommand('gh')) {
    throw new Error('GitHub CLI (gh) is required but not installed.')
  }

  const repoRoot = run('git', ['rev-parse', '--show-toplevel'])
  process.chdir(repoRoot)

  const branch = BRANCH?.trim() || run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  const workflow = WORKFLOW?.trim() || 'ci.yaml'
  const runId = findLatestRunId(branch, workflow)
  if (!runId) {
    throw new Error(`No workflow runs found for branch '${branch}' using workflow '${workflow}'.`)
  }

  const safeBranch = branch.replace(/\//g, '-')
  const path = joinPath(DEST_DIR, safeBranch, runId)
  const dest = joinPath(repoRoot, path)
  await mkdir(dest, { recursive: true })

  console.info(`Downloading artifacts for branch '${branch}' (workflow: ${workflow}, run: ${runId}) into '${path}'...`)
  downloadArtifacts(runId, dest)

  if (cleanup) {
    console.info('Cleaning up videos from successful tests...')
    await cleanupSuccessfulTestVideos(dest)
    console.info('Cleanup complete.')
  }
}

/**
 * Simple usage:
 *  node --experimental-strip-types scripts/download-artifacts.ts
 *
 * Custom usage:
 *  cd tests && BRANCH=main WORKFLOW=rpc-tests.yaml DEST_DIR=tests/artifacts \
 *    node --experimental-strip-types scripts/download-artifacts.ts --skip-cleanup
 */
downloadLatestArtifacts({ cleanup: !process.argv.includes('--skip-cleanup') }).catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
