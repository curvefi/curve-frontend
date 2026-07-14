import { useCallback } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { getSupportedChains } from '@curvefi/prices-api/chains'
import { fromEntries } from '@primitives/objects.utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { type QueryProp, useMappedQuery } from '@ui-kit/types/util'

export const { useQuery: usePricesNetworks } = queryFactory({
  queryKey: () => ['prices', 'networks'] as const,
  queryFn: getSupportedChains,
  validationSuite: EmptyValidationSuite, // no args
  category: 'global.networks',
})

export type TvlSource = 'pool' | 'lending'

export const useNetworksTVL = (source: TvlSource): QueryProp<Record<Chain, number>> =>
  useMappedQuery(
    usePricesNetworks({}),
    useCallback(
      networks =>
        fromEntries(
          networks?.map(network => [network.name, { lending: network.lendingTvl, pool: network.poolTvl }[source]]) ??
            [],
        ),
      [source],
    ),
  )
