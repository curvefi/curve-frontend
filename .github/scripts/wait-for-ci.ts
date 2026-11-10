import { setTimeout } from 'node:timers/promises'
import { assert } from '../../packages/primitives/src/objects.utils.ts'

const { CF_DEPLOY_GITHUB_TOKEN, WORKERS_CI_COMMIT_SHA, WORKERS_CI_BRANCH } = process.env

type WorkflowRun = {
  id: number
  head_sha: string
  head_branch: string
  event: string
  status: string
  run_started_at: string
  html_url: string
}
type WorkflowJob = { name: string; status: string; conclusion: string | null }

const APPS = {
  main: {
    requiredJobs: [
      'Lint, format & typecheck',
      'Cypress component tests in chrome 1',
      'Cypress component tests with RPC',
      ...['llamalend', 'dex', 'other'].map(group => `Cypress e2e ${group} chrome 1`),
    ],
    expectedMinutes: 10,
  },
  stellar: {
    requiredJobs: ['Lint, format & typecheck', 'Cypress Stellar component tests in chrome 1'],
    expectedMinutes: 5,
  },
}

const getGitHubAction = async <T>(path: string, timeoutMs = 30_000): Promise<T> => {
  const response = await fetch(`https://api.github.com/repos/curvefi/curve-frontend/actions/${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      // Optional CF build secret for higher GitHub API rate limits.
      ...(CF_DEPLOY_GITHUB_TOKEN && { Authorization: `Bearer ${CF_DEPLOY_GITHUB_TOKEN}` }),
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    throw new Error(`GitHub API returned HTTP ${response.status}; deployment blocked.\n${await response.text()}`)
  }
  return await response.json()
}

const getActionJobs = async (runId: number, page = 1, pageSize = 100): Promise<WorkflowJob[]> => {
  const { jobs, total_count } = await getGitHubAction<{ jobs: WorkflowJob[]; total_count: number }>(
    `runs/${runId}/jobs?filter=latest&per_page=${pageSize}&page=${page}`,
  )
  return page * pageSize >= total_count ? jobs : [...jobs, ...(await getActionJobs(runId, page + 1, pageSize))]
}

/**
 * Start polling at a fraction of CI's expected duration, counting time already spent building in CF.
 * Use the gate's start time until the CI run is available.
 * Never wait beyond the gate's deadline or return a negative delay.
 */
const getWaitMs = (
  runStartedAt: number,
  expectedMinutes: number,
  pollMs: number,
  deadline: number,
  pollingStartFraction = 0.8,
) => {
  const now = Date.now()
  const pollingStart = runStartedAt + expectedMinutes * 60_000 * pollingStartFraction
  const nextCheck = Math.max(pollingStart, now + pollMs)
  return Math.max(0, Math.min(nextCheck, deadline) - now)
}

/**
 * Gates production deployment by checking Github action status, including latest retries. Retry CF if the gate already failed.
 * CF Settings > Build: set `Deploy command` to `yarn deploy-cf`, running from the app's directory.
 * The build command runs first; keep the preview command ungated.
 */
export async function waitForCi(
  app: string,
  {
    sha = WORKERS_CI_COMMIT_SHA,
    branch = WORKERS_CI_BRANCH,
    timeoutMs = 15 * 60_000, // CF has a timeout of 20 minutes
    // GitHub allows 60 unauthenticated requests/hour per IP; each poll normally uses two, shared with concurrent builds.
    // Rate-limit 403/429: wait for Retry-After / x-ratelimit-reset, increase pollMs, or add token authentication.
    pollMs = 45_000,
  } = {},
) {
  const { requiredJobs, expectedMinutes } = assert(APPS[app as keyof typeof APPS], `Unexpected app "${app}"`)
  const query = new URLSearchParams({
    head_sha: assert(sha, 'WORKERS_CI_COMMIT_SHA is required'),
    branch: assert(branch, 'WORKERS_CI_BRANCH is required'),
    event: 'push',
    per_page: '1',
  })
  const startedAt = Date.now()
  const deadline = startedAt + timeoutMs

  const waitAndPoll = async (message: string, runStartedAt = startedAt): Promise<void> => {
    const waitMs = getWaitMs(runStartedAt, expectedMinutes, pollMs, deadline)
    console.info(
      `${message}. ${Math.round((Date.now() - startedAt) / 1000)}s waiting;`,
      `checking again in ${Math.ceil(waitMs / 1000)}s.`,
    )
    await setTimeout(waitMs)
    return poll()
  }

  const poll = async (): Promise<void> => {
    assert(Date.now() < deadline, `Timed out waiting for ${app} CI at ${sha}; deployment blocked`)
    const { workflow_runs: runs } = await getGitHubAction<{ workflow_runs: WorkflowRun[] }>(
      `workflows/ci.yaml/runs?${query}`,
    )
    const run = runs.find(run => run.head_sha === sha && run.head_branch === branch && run.event === 'push')
    if (!run) return waitAndPoll(`Waiting for ${app} CI run to appear at ${sha}`)
    const jobs = await getActionJobs(run.id)
    const failed = jobs.find(
      job => requiredJobs.includes(job.name) && job.status === 'completed' && job.conclusion !== 'success',
    )
    assert(!failed, `${failed?.name}: ${failed?.conclusion}; deployment blocked (${run.html_url})`)

    const pending = requiredJobs.filter(
      name => !jobs.some(job => job.name === name && job.status === 'completed' && job.conclusion === 'success'),
    )
    if (!pending.length) return console.info(`Required ${app} CI jobs passed: ${run.html_url}`)

    assert(
      run.status !== 'completed',
      `CI finished without passing required jobs: ${pending.join(', ')} (${run.html_url})`,
    )

    return waitAndPoll(
      `Waiting for ${app} CI at ${run.html_url}: ${pending.join(', ')}`,
      Date.parse(run.run_started_at),
    )
  }
  return poll()
}

if (import.meta.main) {
  waitForCi(process.argv[2]).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
