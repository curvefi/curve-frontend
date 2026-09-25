import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type ChainParams, type ChainQuery } from '@evm-ui/queries/root-keys'
import { llamaApiValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useScrvUsdExchangeRate } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [rootKeys.chain({ chainId }), { name: 'st_crvUSD.convertToShares' }] as const,
  queryFn: async (_: ChainQuery) => (await requireLib('llamaApi').st_crvUSD.convertToShares(1)) as Decimal,
  category: 'savings.stats',
  validationSuite: llamaApiValidationSuite,
})
