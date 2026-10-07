const assert = require('node:assert/strict')

const ORIGINAL_START = '<!-- compact-cloudflare:original -->\n'
const ORIGINAL_END = '\n<!-- /compact-cloudflare:original -->'

module.exports = async ({ github, context: { repo, payload }, core }) => {
  const comment_id = payload.comment.id
  // Queued events may contain old build results, so always read the current comment.
  const { data: comment } = await github.rest.issues.getComment({ ...repo, comment_id })

  try {
    assert.equal(comment.user.login, 'cloudflare-workers-and-pages[bot]', 'Unexpected comment author')
    const original = extractOriginalComment(comment)
    const deployment = parseLatestDeployment(original)
    const previewUrl = parsePreviewUrl({ original, deploymentStatus: deployment.deploymentStatus })
    const body = formatCompactComment({ original, deployment, previewUrl })

    if (body !== comment.body) await github.rest.issues.updateComment({ ...repo, comment_id, body })
  } catch (error) {
    core.info(`Cloudflare comment ${comment.html_url ?? comment.id}:\n${comment.body}`)
    throw error
  }
}

const extractOriginalComment = ({ body }) => {
  const startIndex = body.indexOf(ORIGINAL_START)
  const endIndex = body.indexOf(ORIGINAL_END)
  assert(
    (startIndex === -1 && endIndex === -1) || (startIndex !== -1 && endIndex >= startIndex + ORIGINAL_START.length),
    'Incomplete compact comment',
  )
  // Keep Cloudflare's full source and markers intact: it may update sections in place.
  return startIndex === -1 ? body : body.slice(startIndex + ORIGINAL_START.length, endIndex)
}

const parseDeploymentCells = original => {
  assert(original.includes('<!-- Preview Deployments -->'), 'Missing Cloudflare preview deployments marker')
  const row = original.match(/<tbody>\s*<tr>([\s\S]*?)<\/tr>/)?.[1]
  assert(row, 'Missing Cloudflare deployment row')
  const cells = [...row.matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g)].map(([, cell]) => cell)
  assert.equal(cells.length, 5, 'Unrecognized Cloudflare deployment table')
  return cells
}

const parseLatestDeployment = original => {
  const [statusCell, deploymentUrlCell, , updatedCell, dashboardCell] = parseDeploymentCells(original)
  const dashboardUrl = extractDashboardUrl(dashboardCell)
  const logsUrl = extractDashboardUrl(statusCell)
  assert(dashboardUrl, 'Missing Cloudflare dashboard link')
  assert(logsUrl, 'Missing Cloudflare logs link')

  const project = dashboardUrl.match(/\/workers\/services\/view\/([^/]+)\//)?.[1]
  const buildStatus = stripHtml(statusCell.match(/<b>Build:<\/b>([\s\S]*?)<\/li>/)?.[1] ?? '')
  const deploymentStatus = stripHtml(statusCell.match(/<b>Deployment:<\/b>([\s\S]*?)<\/li>/)?.[1] ?? '')
  const updatedDateText = stripHtml(updatedCell)
  assert(project, 'Missing Cloudflare project')
  assert(buildStatus, 'Missing Cloudflare build status')

  // Cloudflare omits deployment details while building or when the build failed.
  if (!deploymentStatus) {
    assert.match(buildStatus, /^(In progress|Failed)\b/i, 'Missing Cloudflare deployment status')
    assert.equal(deploymentUrlCell.trim(), '', 'Unexpected URL without a Cloudflare deployment status')
    assert.match(logsUrl, /\/production\/builds\/[^/]+$/, 'Missing Cloudflare build logs link')
  }
  assert(Number.isFinite(Date.parse(updatedDateText)), 'Invalid Cloudflare deployment timestamp')
  const updatedAt = new Date(updatedDateText).toISOString()

  return { project, dashboardUrl, logsUrl, buildStatus, deploymentStatus, updatedAt }
}

const parsePreviewUrl = ({ original, deploymentStatus }) => {
  // Use Cloudflare's stable Preview URL, never the immutable per-deployment URL.
  const section = original.match(/<!-- Preview URL -->([\s\S]*?)<!-- Preview Deployments -->/)?.[1]
  assert.notEqual(section, undefined, 'Missing Cloudflare preview URL marker')
  // Before the first deployment, Cloudflare leaves this section empty.
  if (!deploymentStatus && !section.trim()) return undefined

  const previewUrl = section.match(/^### Preview URL: (https:\/\/[a-z0-9.-]+\.workers\.dev)(?=\s|$)/m)?.[1]
  assert(previewUrl, 'Missing Cloudflare stable preview URL')
  return previewUrl
}

const formatDeploymentStatus = ({ buildStatus, deploymentStatus }) =>
  /^Success\b/i.test(buildStatus) && /^Success\b/i.test(deploymentStatus)
    ? '✅ Ready'
    : [
        `Build: ${escapeTableCell(buildStatus)}`,
        ...(deploymentStatus ? [`Deployment: ${escapeTableCell(deploymentStatus)}`] : []),
      ].join(' / ')

const formatCompactComment = ({
  original,
  deployment: { project, dashboardUrl, logsUrl, buildStatus, deploymentStatus, updatedAt },
  previewUrl,
}) =>
  [
    ...[
      ['Project', 'Deployment', 'Preview', 'Updated'],
      ['---', '---', '---', '---'],
      [
        `[${project}](<${dashboardUrl}>)`,
        `[${formatDeploymentStatus({ buildStatus, deploymentStatus })}](<${logsUrl}>)`,
        previewUrl ? `[Preview](<${previewUrl}>)` : '—',
        `<relative-time datetime="${updatedAt}">${updatedAt}</relative-time>`,
      ],
    ].map(cells => `| ${cells.join(' | ')} |`),
    '',
    '<details>',
    '<summary>Deployment history</summary>',
    '',
    ORIGINAL_START + original + ORIGINAL_END,
    '</details>',
  ].join('\n')

const stripHtml = html => html.replace(/<[^>]*>/g, '').trim()

const extractDashboardUrl = html =>
  html.match(/href="(https:\/\/dash\.cloudflare\.com\/[^"<>]+)"/)?.[1]?.replaceAll('&amp;', '&')

const escapeTableCell = value => value.replace(/[\\`*_[\]<>|]/g, character => `&#${character.charCodeAt(0)};`)
