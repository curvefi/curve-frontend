import { execFileSync, spawnSync, type ExecFileSyncOptionsWithStringEncoding } from 'child_process'
import { mkdir } from 'fs/promises'

const { BRANCH, WORKFLOW, DEST_DIR, REPOSITORY = 'curvefi/curve-frontend' } = process.env

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
 * Orchestrate download + extraction of the latest workflow artifacts for the current branch.
 */
async function downloadLatestArtifacts(): Promise<void> {
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
  const destRoot = DEST_DIR?.trim() || 'artifacts'
  const dest = [repoRoot, destRoot, safeBranch, runId].join('/')
  await mkdir(dest, { recursive: true })

  console.info(`Downloading artifacts for branch '${branch}' (workflow: ${workflow}, run: ${runId}) into '${dest}'...`)
  downloadArtifacts(runId, dest)
}

downloadLatestArtifacts().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
