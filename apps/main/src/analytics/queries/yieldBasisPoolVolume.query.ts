import { useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { getYieldBasisPoolVolume, type YieldBasisPool } from '@curvefi/prices-api/yield-basis'
import type { Address } from '@primitives/address.utils'
import { useQueries } from '@tanstack/react-query'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type YieldBasisPoolVolumeQuery = { chain: Chain; poolAddress: Address }
type YieldBasisPoolVolumeParams = FieldsOf<YieldBasisPoolVolumeQuery>

const { getQueryOptions: getYieldBasisPoolVolumeOptions } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ chain, poolAddress }: YieldBasisPoolVolumeParams) =>
    ['yield-basis-pool-volume', { chain }, { poolAddress }] as const,
  queryFn: ({ chain, poolAddress }: YieldBasisPoolVolumeQuery) => getYieldBasisPoolVolume(chain, poolAddress),
  validationSuite: EmptyValidationSuite,
})

export const useYieldBasisPoolVolumes = (chain: Chain, pools: YieldBasisPool[] | undefined, enabled = true) =>
  useQueries({
    queries: useMemo(
      () =>
        pools?.map(pool =>
          getYieldBasisPoolVolumeOptions({ chain, poolAddress: pool.address }, enabled && Boolean(pools.length)),
        ) ?? [],
      [chain, enabled, pools],
    ),
  })
