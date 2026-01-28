import { getLlamaMarket, hasVault } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys, type MarketParams, type MarketQuery } from '@ui-kit/lib/model'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import type { Decimal } from '@ui-kit/utils'

export const { useQuery: useDepositMax } = queryFactory({
  queryKey: ({ chainId, marketId }: MarketParams) => [...rootKeys.market({ chainId, marketId }), 'depositMax'] as const,
  queryFn: async ({ marketId }: MarketQuery) => {
    const market = getLlamaMarket(marketId)
    if (!hasVault(market)) throw new Error('Market does not have a vault')
    return (await market.vault.maxDeposit()) as Decimal
  },
  staleTime: '1m',
  validationSuite: marketIdValidationSuite,
})
