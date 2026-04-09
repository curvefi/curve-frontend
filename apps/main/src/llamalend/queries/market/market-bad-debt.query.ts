import { type Endpoint, getBadDebt } from '@curvefi/prices-api/liquidations'
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

export const { useQuery: useBadDebtMarketsQuery } = queryFactory({
  queryKey: ({ type }: BadDebtParams) => ['getBadDebt', { type }, 'v1'] as const,
  queryFn: ({ type }: BadDebtParams) => getBadDebt({ endpoint: endpointFromMarketType[type] }),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})
