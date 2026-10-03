import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams, ChainQuery } from '@evm-ui/queries/query-types'
import { llamaApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useScrvUsdExchangeRate } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'st_crvUSD.convertToShares', chainId }) as const,
  queryFn: async (_: ChainQuery) => (await requireLib('llamaApi').st_crvUSD.convertToShares(1)) as Decimal,
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
