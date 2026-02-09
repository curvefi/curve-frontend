const isDev = process.env.NODE_ENV === 'development'

const SWAP_PERF_BUDGETS = {
  maxFetchXhrCalls: 18,
  maxCurveApiCalls: 12,
  maxFirstInteractiveMs: 5000,
  maxFirstQuoteMs: 2000,
} as const

type SwapPerfState = {
  pathname: string
  startedAt: number
  firstInteractiveAt: number | null
  firstQuoteAt: number | null
  logged: boolean
}

let state: SwapPerfState | null = null

function getResourceEntries() {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return []
  return performance
    .getEntriesByType('resource')
    .filter((entry): entry is PerformanceResourceTiming => 'initiatorType' in entry)
}

function isCurveApiCall(url: string) {
  return (
    url.includes('api.curve.finance') || url.includes('api-core.curve.finance') || url.includes('prices.curve.finance')
  )
}

function getResourceSummary(startedAt: number) {
  const resources = getResourceEntries().filter((entry) => entry.startTime >= startedAt)
  let fetchXhrCalls = 0
  let curveApiCalls = 0
  let scriptCalls = 0

  for (const entry of resources) {
    if (entry.initiatorType === 'script') {
      scriptCalls += 1
    }
    if (entry.initiatorType !== 'fetch' && entry.initiatorType !== 'xmlhttprequest') continue
    fetchXhrCalls += 1
    if (isCurveApiCall(entry.name)) curveApiCalls += 1
  }

  return { fetchXhrCalls, curveApiCalls, scriptCalls }
}

function report() {
  if (!isDev || !state || state.logged) return
  const { startedAt, pathname, firstInteractiveAt, firstQuoteAt } = state
  if (firstInteractiveAt === null) return

  const resourceSummary = getResourceSummary(startedAt)
  const firstInteractiveMs = Math.round(firstInteractiveAt - startedAt)
  const firstQuoteMs = firstQuoteAt === null ? null : Math.round(firstQuoteAt - firstInteractiveAt)

  const metrics = {
    pathname,
    budgets: SWAP_PERF_BUDGETS,
    firstInteractiveMs,
    firstQuoteMs,
    ...resourceSummary,
  }

  console.info('[swap-perf] metrics', metrics)

  const budgetViolations = [
    resourceSummary.fetchXhrCalls > SWAP_PERF_BUDGETS.maxFetchXhrCalls &&
      `fetch/xhr calls ${resourceSummary.fetchXhrCalls} > ${SWAP_PERF_BUDGETS.maxFetchXhrCalls}`,
    resourceSummary.curveApiCalls > SWAP_PERF_BUDGETS.maxCurveApiCalls &&
      `curve api calls ${resourceSummary.curveApiCalls} > ${SWAP_PERF_BUDGETS.maxCurveApiCalls}`,
    firstInteractiveMs > SWAP_PERF_BUDGETS.maxFirstInteractiveMs &&
      `first interactive ${firstInteractiveMs}ms > ${SWAP_PERF_BUDGETS.maxFirstInteractiveMs}ms`,
    typeof firstQuoteMs === 'number' &&
      firstQuoteMs > SWAP_PERF_BUDGETS.maxFirstQuoteMs &&
      `first quote ${firstQuoteMs}ms > ${SWAP_PERF_BUDGETS.maxFirstQuoteMs}ms`,
  ].filter(Boolean)

  if (budgetViolations.length > 0) {
    console.warn('[swap-perf] budget exceeded', budgetViolations)
  }

  state.logged = true
}

export function startSwapPerfTracking(pathname: string) {
  if (!isDev || typeof performance === 'undefined') return
  state = {
    pathname,
    startedAt: performance.now(),
    firstInteractiveAt: null,
    firstQuoteAt: null,
    logged: false,
  }
}

export function markSwapFirstInteractive() {
  if (!isDev || !state || typeof performance === 'undefined' || state.firstInteractiveAt !== null) return
  state.firstInteractiveAt = performance.now()
  report()
}

export function markSwapFirstQuoteReady() {
  if (!isDev || !state || typeof performance === 'undefined' || state.firstQuoteAt !== null) return
  state.firstQuoteAt = performance.now()
  report()
}
