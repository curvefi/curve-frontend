import { ethAddress } from 'viem'
import { networks as lendNetworks } from '@/lend/networks'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { mockLendingSnapshots } from '@cy/support/helpers/lending-mocks'
import { mockTokenMetadata } from '@cy/support/helpers/tokens'
import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { type GasInfo, type GasInfoQueryOptions, setGasInfoAndUpdateLib } from '@evm-ui/queries/gas-info.query'
import { setTokenUsdRateQueryData } from '@evm-ui/queries/token-usd-rate.query'
import { queryClient } from '@ui/features/queries/query-client'
import { blockUnmockedApis, mockCollateralEvents } from './market-list-mocks'

export const llamaNetworks: NetworkDict<LlamaChainId> = lendNetworks

export const setLlamaApi = (llamaApi: unknown) => (globalLibs.current.llamaApi = llamaApi as never)

export const resetLlamaTestContext = () => {
  queryClient.clear()
  globalLibs.current = {}
  globalLibs.hydrated = {}
}

export const setupMockedComponentTest = () => {
  resetLlamaTestContext()
  const unsubscribe = queryClient.getQueryCache().subscribe(event => {
    if (event.type !== 'updated' || (event.action.type !== 'failed' && event.action.type !== 'error')) return
    const error: unknown = event.action.error
    // Report globally so React Query cannot swallow the test failure.
    reportError(
      new Error(
        `Unexpected query failure in mocked test ${event.query.queryHash}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      ),
    )
  })
  cy.once('test:after:run', unsubscribe)
  blockUnmockedApis(req => {
    throw new Error(`Unmocked API request: ${req.method} ${req.url}`)
  })
}

export const setupMockedLlamalendComponentTest = () => {
  setupMockedComponentTest()
  cy.intercept('https://prices.curve.finance/v1/crvusd/markets/*/*/snapshots*', { fixture: 'minting-snapshots.json' })
  mockLendingSnapshots('ethereum')
  mockCollateralEvents()
  mockTokenMetadata()
  cy.intercept({ pathname: '/api/merkl/v1/opportunities' }, { body: [] })
}

export const setGasInfo = (
  params: GasInfoQueryOptions,
  info: GasInfo = {
    gasPrice: 160000000,
    priority: [98000000, 89000000, 79000000, 59000000],
    max: [220000000, 210000000, 200000000, 180000000],
    basePlusPriority: [156794470, 147794470, 137794470, 117794470],
  },
  ethPrice = 1,
) => {
  setTokenUsdRateQueryData({ chainId: params.chainId, tokenAddress: ethAddress }, ethPrice)
  return setGasInfoAndUpdateLib(params, info)
}
