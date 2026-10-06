import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import compact from './compact-cloudflare-comment.cjs'

// Recorded Cloudflare comment bodies, including their original deployment history.
// ready: https://github.com/curvefi/curve-frontend/pull/3352#issuecomment-5996396054 (2026-10-05)
// Other fixtures: https://github.com/curvefi/curve-frontend/pull/3294#issuecomment-5854685325
// building / failed: 2026-10-05; first-building: 2026-09-30; first-failed: 2026-09-27.
const fixture = (name: string) => readFileSync(new URL(`./fixtures/cloudflare/${name}.txt`, import.meta.url), 'utf8')
const READY = fixture('ready')
const BUILDING = fixture('building')
const FAILED = fixture('failed')
const FIRST_BUILDING = fixture('first-building')
const FIRST_FAILED = fixture('first-failed')
const ORIGINAL_START = '<!-- compact-cloudflare:original -->\n'
const ORIGINAL_END = '\n<!-- /compact-cloudflare:original -->'
const COMMENT_PARAMS = { owner: 'curvefi', repo: 'curve-frontend', comment_id: 5854685325 }
const COMMENT_URL = 'https://github.com/curvefi/curve-frontend/pull/3294#issuecomment-5854685325'

const setup = (body: string) => {
  const comment = {
    id: COMMENT_PARAMS.comment_id,
    html_url: COMMENT_URL,
    user: { login: 'cloudflare-workers-and-pages[bot]' },
    body,
  }
  const getComment = vi.fn().mockResolvedValue({ data: comment })
  const updateComment = vi.fn(async (_params: typeof COMMENT_PARAMS & { body: string }) => ({}))
  const core = { info: vi.fn() }
  const context = {
    repo: { owner: COMMENT_PARAMS.owner, repo: COMMENT_PARAMS.repo },
    payload: { comment: { id: comment.id, body } },
  }
  const github = { rest: { issues: { getComment, updateComment } } }
  return { comment, getComment, updateComment, core, context, github }
}

describe('compactCloudflareComment', () => {
  it('compacts a comment created successful, using the stable preview URL', async () => {
    const args = setup(READY)

    await compact(args)

    expect(args.getComment).toHaveBeenCalledWith(COMMENT_PARAMS)
    expect(args.updateComment).toHaveBeenCalledExactlyOnceWith({ ...COMMENT_PARAMS, body: expect.any(String) })
    const body = args.updateComment.mock.calls[0][0].body
    const summary = body.split('\n\n<details>')[0]
    expect(summary).toBe(
      '| Project | Deployment | Preview | Updated |\n' +
        '| --- | --- | --- | --- |\n' +
        '| [curve-frontend](<https://dash.cloudflare.com/?to=/95470c464083fb18e999d9fb68e92a62/workers/services/view/curve-frontend/production/previews/test-deposit>) | ' +
        '[✅ Ready](<https://dash.cloudflare.com/?to=/95470c464083fb18e999d9fb68e92a62/workers/services/view/curve-frontend/production/previews/test-deposit/deployments/71321f71-e2fe-4630-8623-b3e3d0adf3de>) | ' +
        '[Preview](<https://test-deposit-curve-frontend.michael-954.workers.dev>) | ' +
        '<relative-time datetime="2026-10-05T14:19:49.864Z">2026-10-05T14:19:49.864Z</relative-time> |',
    )
    expect(body).toContain(ORIGINAL_START + READY + ORIGINAL_END)
    expect(args.core.info).not.toHaveBeenCalled()
  })

  it('supports additional Cloudflare projects without a fixed project list', async () => {
    const args = setup(READY.replaceAll('curve-frontend', 'another-project'))

    await compact(args)

    expect(args.updateComment).toHaveBeenCalledTimes(1)
    const summary = args.updateComment.mock.calls[0][0].body.split('\n\n<details>')[0]
    expect(summary).toContain('| [another-project](<https://dash.cloudflare.com/')
    expect(summary).toContain('[Preview](<https://test-deposit-another-project.michael-954.workers.dev>)')
  })

  it.each([
    { name: 'building', original: BUILDING, status: 'Build: In progress 🔵', hasPreview: true },
    { name: 'failed', original: FAILED, status: 'Build: Failed ❌', hasPreview: true },
    { name: 'first-building', original: FIRST_BUILDING, status: 'Build: In progress 🔵', hasPreview: false },
    { name: 'first-failed', original: FIRST_FAILED, status: 'Build: Failed ❌', hasPreview: false },
  ])('compacts $name without deployment details and preserves history', async ({ original, status, hasPreview }) => {
    const args = setup(original)

    await compact(args)

    expect(args.updateComment).toHaveBeenCalledTimes(1)
    const body = args.updateComment.mock.calls[0][0].body
    const summary = body.split('\n\n<details>')[0]
    expect(summary).toContain(`[${status}](<https://dash.cloudflare.com/`)
    expect(summary).toContain('/production/builds/')
    expect(summary).not.toContain('✅ Ready')
    expect(summary).not.toContain('/ Deployment:')
    expect(summary).toContain(
      hasPreview ? '[Preview](<https://refactor-deposit-curve-frontend.michael-954.workers.dev>)' : '| — |',
    )
    expect(body).toContain(ORIGINAL_START + original + ORIGINAL_END)
  })

  it.each(['ready', 'building', 'failed', 'first-building', 'first-failed'])(
    'does not update an already-collapsed %s comment',
    async name => {
      const args = setup(fixture(name))
      await compact(args)
      const body = args.updateComment.mock.calls[0][0].body
      args.comment.body = body
      args.updateComment.mockClear()

      await compact(args)

      expect(args.updateComment).not.toHaveBeenCalled()
    },
  )

  it('uses the fetched comment when the event payload contains an older build', async () => {
    const args = setup(READY)
    args.context.payload.comment.body = BUILDING

    await compact(args)

    const body = args.updateComment.mock.calls[0][0].body
    expect(body).toContain('[✅ Ready]')
    expect(body).toContain(ORIGINAL_START + READY + ORIGINAL_END)
    expect(body).not.toContain(BUILDING)
  })

  it('refreshes a collapsed summary after Cloudflare updates the original inside it', async () => {
    const args = setup(FIRST_BUILDING)
    await compact(args)
    args.comment.body = args.updateComment.mock.calls[0][0].body.replace(
      ORIGINAL_START + FIRST_BUILDING + ORIGINAL_END,
      ORIGINAL_START + READY + ORIGINAL_END,
    )
    args.updateComment.mockClear()

    await compact(args)

    expect(args.updateComment).toHaveBeenCalledTimes(1)
    const body = args.updateComment.mock.calls[0][0].body
    expect(body.split('\n\n<details>')[0]).toContain('[✅ Ready]')
    expect(body).toContain(ORIGINAL_START + READY + ORIGINAL_END)
    expect(body.match(/<details>/g)).toHaveLength(1)
  })

  it.each([
    {
      name: 'a successful build with no deployment status',
      body: READY.replace('<li><b>Deployment:</b> Success ✅</li>', ''),
      error: 'Missing Cloudflare deployment status',
    },
    {
      name: 'a successful deployment with no stable preview URL',
      body: READY.replace(/^### Preview URL: .*\n###### .*\n/m, ''),
      error: 'Missing Cloudflare stable preview URL',
    },
    { name: 'incomplete original-comment markers', body: ORIGINAL_START + READY, error: 'Incomplete compact comment' },
  ])('logs the fetched original and refuses to overwrite $name', async ({ body, error }) => {
    const args = setup(body)
    args.context.payload.comment.body = 'outdated event payload'

    await expect(compact(args)).rejects.toThrow(error)

    expect(args.updateComment).not.toHaveBeenCalled()
    expect(args.core.info).toHaveBeenCalledWith(`Cloudflare comment ${COMMENT_URL}:\n${body}`)
  })
})
