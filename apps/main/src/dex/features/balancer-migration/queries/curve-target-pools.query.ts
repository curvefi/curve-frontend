import { isAddressEqual } from 'viem'
import { listPools } from '@curvefi/prices-api/pools'
import type { ChainQuery } from '@evm-ui/queries/query-types'
import { chainValidationGroup } from '@evm-ui/queries/validation/chain-validation'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { poolToRowData } from '@ui/features/pool-list/utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type CurveTargetPoolsQuery = ChainQuery & { poolAddresses: Address[] }

/** Pool-list rows (type, gauge, APRs) for the matched targets, which the legacy prices API lacks. */
export const { useQuery: useCurveTargetPools } = queryFactory({
  queryKey: ({ chainId, poolAddresses }: FieldsOf<CurveTargetPoolsQuery>) =>
    ({ name: 'balancerMigration.curvePools', chainId, poolAddresses }) as const,
  queryFn: async ({ chainId, poolAddresses }: CurveTargetPoolsQuery) => {
    const results = await Promise.all(
      poolAddresses.map(searchString => listPools({ chainId, searchString, pagination: 5 })),
    )
    return notFalsy(
      ...results.map(({ pools }, i) => pools.find(({ address }) => isAddressEqual(address, poolAddresses[i]))),
    ).map(poolToRowData)
  },
  category: 'dex.pools',
  validationSuite: createValidationSuite(({ chainId }: FieldsOf<CurveTargetPoolsQuery>) =>
    chainValidationGroup({ chainId }),
  ),
})
