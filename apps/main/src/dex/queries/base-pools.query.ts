import { requireLib } from '@evm-ui/features/connect-wallet'
import { useHydratedQuery } from '@evm-ui/hooks/useHydratedQuery'
import type { ChainParams } from '@evm-ui/queries/query-types'
import { curveApiWithWalletValidationSuite } from '@evm-ui/queries/validation/curve-api-validation'
import { queryFactory } from '@ui/features/queries/factory'
import type { QueryData } from '@ui/features/queries/util'

const { useQuery: useBasePoolsQuery, getQueryData: getBasePools } = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ({ name: 'base-pools', chainId }) as const,
  queryFn: async () => await requireLib('curveApi').getBasePools(),
  validationSuite: curveApiWithWalletValidationSuite,
  category: 'dex.poolParams',
})

export { getBasePools }

export const useBasePools = (params: ChainParams, enabled = true) =>
  useHydratedQuery(useBasePoolsQuery, params, enabled)

export type BasePool = QueryData<typeof useBasePools>[number]
