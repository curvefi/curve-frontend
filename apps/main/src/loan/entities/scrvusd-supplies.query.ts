import type { Decimal } from '@primitives/decimal.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type ChainParams, type ChainQuery } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

export type ScrvUsdSupplies = {
  crvUSD: Decimal
  scrvUSD: Decimal
}

export const { useQuery: useScrvUsdSupplies } = queryFactory({
  queryKey: ({ chainId }: ChainParams) =>
    [...rootKeys.chain({ chainId }), 'st_crvUSD.totalSupplyAndCrvUSDLocked'] as const,
  queryFn: async (_: ChainQuery) => {
    const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.totalSupplyAndCrvUSDLocked()
    return { crvUSD: crvUSD as Decimal, scrvUSD: st_crvUSD as Decimal } satisfies ScrvUsdSupplies
  },
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
