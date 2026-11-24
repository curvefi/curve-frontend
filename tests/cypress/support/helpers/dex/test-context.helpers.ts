import { blockUnmockedApis } from '@cy/support/helpers/llamalend/market-list-mocks'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { QUERY_CATEGORIES } from '@ui/features/queries/query-categories'
import { queryClient } from '@ui/features/queries/query-client'

export const setupMockedPoolComponentTest = () => {
  queryClient.clear()
  globalLibs.current = {}
  globalLibs.hydrated = {}
  const unsubscribe = queryClient.getQueryCache().subscribe(event => {
    if (event.type !== 'updated' || (event.action.type !== 'failed' && event.action.type !== 'error')) return
    reportError(
      new Error(`Unexpected query failure in mocked test ${event.query.queryHash}`, { cause: event.action.error }),
    )
  })
  cy.once('test:after:run', unsubscribe)
  blockUnmockedApis(req => {
    throw new Error(`Unmocked API request: ${req.method} ${req.url}`)
  })
  cy.stub(QUERY_CATEGORIES, 'global.tokenBalances').value({
    ...QUERY_CATEGORIES['global.tokenBalances'],
    staleTime: 'static',
    refetchInterval: false,
  })
}
