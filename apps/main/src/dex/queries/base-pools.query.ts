import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys, type ChainParams } from '@evm-ui/queries/root-keys'
import { curveApiWithWalletValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'

export const { useQuery: useBasePools, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => [...rootKeys.chain({ chainId }), 'base-pools'] as const,
  queryFn: async () => await requireLib('curveApi').getBasePools(),
  validationSuite: curveApiWithWalletValidationSuite,
  category: 'dex.poolParams',
})

export type BasePool = QueryData<typeof useBasePools>[number]
