import type { Chain } from '@curvefi/prices-api'
import { getAllMarkets as getAllCrvUsdMarkets } from '@curvefi/prices-api/crvusd'
import { getAllMarkets as getAllLendingMarkets } from '@curvefi/prices-api/llamalend'
import type { Address } from '@primitives/address.utils'
import { recordEntries } from '@primitives/objects.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { LlamaMarketType } from '@ui-kit/types/market'

type MarketExposureParams = {
  type: LlamaMarketType
}

export type MarketExposure = {
  chain: Chain
  controllerAddress: Address
  exposureUsd: number | null
}

const getMarketExposure = async (type: LlamaMarketType): Promise<MarketExposure[]> => {
  if (type === LlamaMarketType.Lend) {
    const marketsByChain = await getAllLendingMarkets()

    return recordEntries(marketsByChain).flatMap(([chain, markets]) =>
      markets.map((market) => ({
        chain,
        controllerAddress: market.controller,
        exposureUsd: market.totalAssetsUsd,
      })),
    )
  }

  const marketsByChain = await getAllCrvUsdMarkets()

  return recordEntries(marketsByChain).flatMap(([chain, markets]) =>
    markets.map((market) => ({
      chain,
      controllerAddress: market.address,
      exposureUsd: market.borrowedUsd,
    })),
  )
}

/**
 * Returns the value used to measure bad debt for each market.
 * For lending markets this is total supplied liquidity
 * For mint markets this is outstanding debt, since mint markets do not have suppliers at the market level.
 */
export const { useQuery: useMarketExposureQuery } = queryFactory({
  queryKey: ({ type }: MarketExposureParams) => ['getMarketExposure', { type }, 'v1'] as const,
  queryFn: ({ type }: MarketExposureParams) => getMarketExposure(type),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})
