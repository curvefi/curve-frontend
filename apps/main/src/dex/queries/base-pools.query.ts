import { requireLib } from '@evm-ui/features/connect-wallet'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { curveApiWithWalletValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'

export const { useQuery: useBasePools, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'base-pools', chainId }),
  queryFn: async () => await requireLib('curveApi').getBasePools(),
  validationSuite: curveApiWithWalletValidationSuite,
  category: 'dex.poolParams',
})

export type BasePool = QueryData<typeof useBasePools>[number]
