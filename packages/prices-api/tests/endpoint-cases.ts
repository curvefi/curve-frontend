/** Shared Vitest harness for live endpoint schema checks. */
import { describe, expect, it, type TestContext } from 'vitest'
import {
  endpointCatalogIsCurrent,
  endpointId,
  formatEndpointCatalogStatus,
  getEndpointCatalogStatus,
  type EndpointId,
  type EndpointModule,
} from './catalog'
import { createFetchTracker, formatTrackedFetchUrls } from './fetch-tracker'
import { endpointTestSeed } from './seeds'

export { endpointId, type EndpointId, type EndpointModule }

type EndpointCase = {
  functionName: string
  labelSuffix?: string
  run: () => Promise<unknown>
}

/** Registers a wrapper invocation; use the optional suffix for multiple cases of one function. */
export function endpointCase(functionName: string, run: () => Promise<unknown>): EndpointCase
export function endpointCase(functionName: string, labelSuffix: string, run: () => Promise<unknown>): EndpointCase
export function endpointCase(
  functionName: string,
  labelSuffixOrRun: string | (() => Promise<unknown>),
  run?: () => Promise<unknown>,
): EndpointCase {
  const labelSuffix = typeof labelSuffixOrRun === 'string' ? labelSuffixOrRun : undefined
  const endpointRun = typeof labelSuffixOrRun === 'function' ? labelSuffixOrRun : run

  if (!endpointRun) {
    throw new Error(`Missing endpoint runner for ${functionName}`)
  }

  return { functionName, labelSuffix, run: endpointRun }
}

/** Creates concurrent live tests for one module and skips network calls when the catalog is stale. */
export const runEndpointCases = (moduleName: EndpointModule, endpointCases: EndpointCase[]) => {
  describe(`live endpoint schemas / ${moduleName}`, () => {
    for (const endpoint of endpointCases) {
      it.concurrent(endpointLabel(moduleName, endpoint), async ({ annotate, skip }) => {
        const skipReason = getCatalogSkipReason()

        if (skipReason) {
          skip(skipReason)
        }

        await runEndpointCase(endpoint, annotate)
      })
    }
  })
}

const runEndpointCase = async (endpoint: EndpointCase, annotate: TestContext['annotate']) => {
  const fetchTracker = createFetchTracker()

  try {
    const result = await fetchTracker.run(endpoint.run)
    expect(result).toBeDefined()
  } catch (error) {
    await annotate(`PRICES_API_TEST_SEED=${endpointTestSeed}`, 'endpoint-seed')

    if (fetchTracker.urls.length > 0) {
      await annotate(formatTrackedFetchUrls(fetchTracker.urls), 'endpoint-url')
    }

    throw error
  }
}

const endpointLabel = (moduleName: EndpointModule, endpoint: EndpointCase) =>
  endpoint.labelSuffix
    ? `${moduleName}.${endpoint.functionName}(${endpoint.labelSuffix})`
    : `${moduleName}.${endpoint.functionName}`

const getCatalogSkipReason = (() => {
  let skipReason: string | undefined

  return () => {
    if (skipReason !== undefined) {
      return skipReason
    }

    const status = getEndpointCatalogStatus()

    skipReason = endpointCatalogIsCurrent(status)
      ? ''
      : `Endpoint catalog is out of date; skipping live endpoint call. ${formatEndpointCatalogStatus(status)}`

    return skipReason
  }
})()
