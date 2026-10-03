import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@evm-ui/queries/query-types'
import { llamaApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useScrvUsdSupplies } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'st_crvUSD.totalSupplyAndCrvUSDLocked', chainId }),
  queryFn: async (_: ChainQuery) => {
    const { crvUSD, st_crvUSD } = await requireLib('llamaApi').st_crvUSD.totalSupplyAndCrvUSDLocked()
    return { crvUSD: crvUSD as Decimal, scrvUSD: st_crvUSD as Decimal }
  },
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
