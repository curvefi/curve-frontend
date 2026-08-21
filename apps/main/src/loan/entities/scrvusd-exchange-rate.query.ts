import { requireLib } from '@evm-ui/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams, type ChainQuery } from '@evm-ui/lib/model'
import { llamaApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'

export const { useQuery: useScrvUsdExchangeRate } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'st_crvUSD.convertToShares'] as const,
  queryFn: async (_: ChainQuery) => (await requireLib('llamaApi').st_crvUSD.convertToShares(1)) as Decimal,
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
