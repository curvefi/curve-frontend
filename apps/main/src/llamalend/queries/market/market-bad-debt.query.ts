import { type Endpoint, getBadDebt } from '@curvefi/prices-api/liquidations'
import { recordValues } from '@primitives/objects.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { MarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: MarketType
}

const endpointFromMarketType: Record<MarketType, Endpoint> = {
  [MarketType.Lend]: 'lending',
  [MarketType.Mint]: 'crvusd',
}

const { getQueryOptions: getBadDebtMarketsOptionsQuery, reset: resetBadDebtMarketsQuery } = queryFactory({
  queryKey: ({ type }: BadDebtParams) => ['getBadDebt', { type }, 'v1'] as const,
  queryFn: ({ type }: BadDebtParams) => getBadDebt({ endpoint: endpointFromMarketType[type] }),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})

export const getBadDebtLendMarketsOptions = (enabled = true) =>
  getBadDebtMarketsOptionsQuery({ type: MarketType.Lend }, enabled)

export const getBadDebtMintMarketsOptions = (enabled = true) =>
  getBadDebtMarketsOptionsQuery({ type: MarketType.Mint }, enabled)

export const resetBadDebtMarkets = async () =>
  Promise.all(recordValues(MarketType).map(type => resetBadDebtMarketsQuery({ type })))
