import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams, type ChainQuery } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export const { useQuery: useScrvUsdExchangeRate } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'st_crvUSD.convertToShares'] as const,
  queryFn: async (_: ChainQuery) => (await requireLib('llamaApi').st_crvUSD.convertToShares(1)) as Decimal,
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
