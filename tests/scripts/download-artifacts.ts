import { execFile, type ExecFileOptionsWithStringEncoding, spawnSync } from 'child_process'
import { mkdir, readdir, rmdir, unlink, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { stripVTControlCharacters } from 'util'

const { ARTIFACT_BRANCH, BRANCH, WORKFLOW, RUN_ID, REPOSITORY = 'curvefi/curve-frontend' } = process.env
const DEST_DIR = 'artifacts'
const MAX_LOG_SIZE = 100 * 1024 * 1024

type WorkflowJob = {
  databaseId: number
  name: string
}

/**
 * Execute a command and return trimmed stdout.
 */
const run = (command: string, args: string[], options?: ExecFileOptionsWithStringEncoding): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(command, args, { encoding: 'utf8', ...options }, (error, stdout) =>
      error ? reject(new Error(`${error.code}`, { cause: error })) : resolve(stdout.trim()),
    )
  })

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
const findLatestRunId = (branch: string, workflow: string): Promise<string> =>
  run('gh', [
    'run',
    'list',
    '--repo',
    REPOSITORY,
    '--branch',
    branch,
    '--workflow',
    `${workflow}.yaml`,
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
const downloadArtifacts = async (runId: string, dest: string) => {
  if (await getArtifactCount(runId)) {
    runStreaming('gh', ['run', 'download', runId, '--repo', REPOSITORY, '--dir', dest])
  } else {
    console.info('No workflow artifacts to download.')
  }
}

const getFailedJobs = async (runId: string): Promise<WorkflowJob[]> =>
  JSON.parse(
    await run('gh', [
      'run',
      'view',
      runId,
      '--repo',
      REPOSITORY,
      '--json',
      'jobs',
      '--jq',
      '[.jobs[] | select(.conclusion == "failure") | {databaseId, name}]',
    ]),
  ) as WorkflowJob[]

const safeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '')

/** Download the failed steps from each failed job because Actions logs are not workflow artifacts. */
async function downloadFailedJobLogs(runId: string, dest: string) {
  const failedJobs = await getFailedJobs(runId)
  if (failedJobs.length === 0) return console.info('No failed job logs to download.')

  const logsDir = join(dest, 'failed-job-logs')
  await mkdir(logsDir, { recursive: true })

  await Promise.all(
    failedJobs.map(async job => {
      const log = await run(
        'gh',
        ['run', 'view', '--repo', REPOSITORY, '--job', String(job.databaseId), '--log-failed'],
        {
          encoding: 'utf8',
          maxBuffer: MAX_LOG_SIZE,
        },
      )
      const path = join(logsDir, `${job.databaseId}-${safeFilename(job.name)}.log`)
      await writeFile(path, `${stripVTControlCharacters(log)}\n`)
      console.info(`Downloaded failed job log: ${path}`)
    }),
  )
}

const getArtifactCount = (runId: string) =>
  run('gh', ['api', `repos/${REPOSITORY}/actions/runs/${runId}/artifacts`, '--jq', '.total_count']).then(Number)

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
 * Orchestrate download + extraction of workflow artifacts.
 */
async function downloadLatestArtifacts({ cleanup }: { cleanup: boolean }): Promise<void> {
  if (!hasCommand('gh')) {
    throw new Error('GitHub CLI (gh) is required but not installed.')
  }

  const repoRoot = await run('git', ['rev-parse', '--show-toplevel'])
  process.chdir(repoRoot)

  const branch = BRANCH?.trim() || (await run('git', ['rev-parse', '--abbrev-ref', 'HEAD']))
  const artifactBranch = ARTIFACT_BRANCH?.trim() || branch
  const workflow = WORKFLOW?.trim() || 'ci'
  const runId = RUN_ID || (await findLatestRunId(branch, workflow))
  if (!runId) throw new Error(`No ${workflow} runs for branch '${branch}'`)

  const path = join(DEST_DIR, artifactBranch.replace(/\//g, '-') || 'current', runId)
  const destination = join(repoRoot, path)
  await mkdir(destination, { recursive: true })

  console.info(
    `Downloading failure evidence for branch '${branch}' (artifact branch: ${artifactBranch}, workflow: ${workflow}, run: ${runId}) into '${path}'...`,
  )
  await Promise.all([downloadFailedJobLogs(runId, destination), downloadArtifacts(runId, destination)])

  if (cleanup) {
    console.info('Cleaning up videos from successful tests...')
    await cleanupSuccessfulTestVideos(destination)
    console.info('Cleanup complete.')
  }
}

/**
 * Simple usage:
 *  node --experimental-strip-types scripts/download-artifacts.ts
 *
 * Custom usage:
 *  cd tests && BRANCH=main ARTIFACT_BRANCH=fix/flaky-tests-1234abcd WORKFLOW=rpc-tests \
 *    node --experimental-strip-types scripts/download-artifacts.ts --skip-cleanup
 */
downloadLatestArtifacts({ cleanup: !process.argv.includes('--skip-cleanup') }).catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
