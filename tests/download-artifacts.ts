import path from 'path'
import { execFileSync, spawnSync, type ExecFileSyncOptionsWithStringEncoding } from 'child_process'
import { mkdir, readdir, unlink } from 'fs/promises'

type Extractor = (zipPath: string, targetDir: string) => void

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
 * Pick an available extractor (prefers unzip, falls back to tar).
 */
function pickExtractor(): Extractor {
  if (hasCommand('unzip')) {
    return (zipPath, targetDir) => runStreaming('unzip', [zipPath, '-d', targetDir])
  }
  if (hasCommand('tar')) {
    return (zipPath, targetDir) => runStreaming('tar', ['--extract', '--file', zipPath, '--directory', targetDir])
  }
  throw new Error("Need either 'unzip' or 'tar' available to extract artifacts.")
}

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
 * List zip files directly under dest.
 */
async function listZipArtifacts(dest: string): Promise<string[]> {
  const entries = await readdir(dest, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.zip'))
    .map((entry) => path.join(dest, entry.name))
}

/**
 * Extract all artifacts and remove the source zips.
 */
async function extractArtifacts(zips: string[], dest: string, extract: Extractor) {
  for (const zipPath of zips) {
    const artifactName = path.basename(zipPath).replace(/\.zip$/i, '')
    const targetDir = path.join(dest, artifactName)
    await mkdir(targetDir, { recursive: true })
    console.info(`Extracting ${path.basename(zipPath)} to ${targetDir}...`)
    extract(zipPath, targetDir)
    await unlink(zipPath)
  }
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
  const dest = path.join(repoRoot, destRoot, safeBranch, runId)
  await mkdir(dest, { recursive: true })

  console.info(`Downloading artifacts for branch '${branch}' (workflow: ${workflow}, run: ${runId}) into '${dest}'...`)
  downloadArtifacts(runId, dest)

  const zips = await listZipArtifacts(dest)
  if (zips.length === 0) {
    console.info(`No zip artifacts found under ${dest} (nothing to extract).`)
    return
  }

  const extract = pickExtractor()
  await extractArtifacts(zips, dest, extract)

  console.info(`Artifacts extracted under ${dest}`)
}

downloadLatestArtifacts().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
