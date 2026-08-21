import { requireLib } from '@evm-ui/features/connect-wallet'
import { type ChainParams, type ChainQuery, queryFactory, rootKeys } from '@evm-ui/lib/model'
import { llamaApiValidationSuite } from '@evm-ui/lib/model/query/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'

export const { useQuery: useScrvUsdSupplies } = queryFactory({
  queryKey: ({ chainId }: ChainParams) =>
    [...rootKeys.chain({ chainId }), 'st_crvUSD.totalSupplyAndCrvUSDLocked'] as const,
  queryFn: async (_: ChainQuery) => {
    const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.totalSupplyAndCrvUSDLocked()
    return { crvUSD: crvUSD as Decimal, scrvUSD: st_crvUSD as Decimal }
  },
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
