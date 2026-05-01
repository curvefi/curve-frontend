import { type Endpoint, getBadDebt } from '@curvefi/prices-api/liquidations'
import { recordValues } from '@primitives/objects.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
}

const endpointFromMarketType: Record<LlamaMarketType, Endpoint> = {
  [LlamaMarketType.Lend]: 'lending',
  [LlamaMarketType.Mint]: 'crvusd',
}

const { getQueryOptions: getBadDebtMarketsOptionsQuery, invalidate: invalidateBadDebtMarketsQuery } = queryFactory({
  queryKey: ({ type }: BadDebtParams) => ['getBadDebt', { type }, 'v1'] as const,
  queryFn: ({ type }: BadDebtParams) => getBadDebt({ endpoint: endpointFromMarketType[type] }),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})

export const getBadDebtLendMarketsOptions = (enabled = true) =>
  getBadDebtMarketsOptionsQuery({ type: LlamaMarketType.Lend }, enabled)

export const getBadDebtMintMarketsOptions = (enabled = true) =>
  getBadDebtMarketsOptionsQuery({ type: LlamaMarketType.Mint }, enabled)

export const invalidateBadDebtMarkets = async () =>
  Promise.all(recordValues(LlamaMarketType).map(type => invalidateBadDebtMarketsQuery({ type })))
