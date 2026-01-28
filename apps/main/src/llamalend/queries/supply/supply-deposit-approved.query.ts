import { getLlamaMarket, hasVault } from '@/llamalend/llama.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { DepositParams, DepositQuery, depositValidationSuite } from '../validation/supply.validation'

export const { useQuery: useDepositIsApproved, fetchQuery: fetchDepositIsApproved } = queryFactory({
  queryKey: ({ chainId, marketId, depositAmount }: DepositParams) =>
    [...rootKeys.market({ chainId, marketId }), 'depositIsApproved', { depositAmount }] as const,
  queryFn: async ({ marketId, depositAmount }: DepositQuery) => {
    const market = getLlamaMarket(marketId)
    if (!hasVault(market)) throw new Error('Market does not have a vault')
    return await market.vault.depositIsApproved(depositAmount)
  },
  staleTime: '1m',
  validationSuite: depositValidationSuite,
})
