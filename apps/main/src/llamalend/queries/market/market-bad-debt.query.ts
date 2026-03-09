import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { type Endpoint, getBadDebt } from '@curvefi/prices-api/liquidations'
import { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'

type BadDebtParams = {
  endpoint: Endpoint
}

const BAD_DEBT_THRESHOLD = 0

export const { useQuery: useBadDebtMarketsQuery } = queryFactory({
  queryKey: ({ endpoint }: BadDebtParams) => ['llamalend-bad-debt', { endpoint }, 'v1'] as const,
  queryFn: ({ endpoint }: BadDebtParams) => getBadDebt({ endpoint }),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})

export const useBadDebtMarket = ({
  endpoint,
  blockchainId,
  controllerAddress,
}: {
  endpoint: Endpoint
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}) => {
  const { data } = useBadDebtMarketsQuery({ endpoint }, !!blockchainId && !!controllerAddress)

  return useMemo(() => {
    if (!blockchainId || !controllerAddress || !data?.length) return null

    const market = data.find(
      (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )

    // filter out market without bad debt (badDebt = 0)
    return market?.badDebt != null && market.badDebt > BAD_DEBT_THRESHOLD ? market.badDebt : null
  }, [blockchainId, controllerAddress, data])
}
