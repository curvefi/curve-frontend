import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { type Endpoint, getBadDebt } from '@curvefi/prices-api/liquidations'
import { Address } from '@primitives/address.utils'
import { queryFactory } from '@ui-kit/lib/model/query'
import { EmptyValidationSuite } from '@ui-kit/lib/validation'
import { LlamaMarketType } from '@ui-kit/types/market'

type BadDebtParams = {
  type: LlamaMarketType
}

const BAD_DEBT_THRESHOLD = 0

const endpointFromMarketType: Record<LlamaMarketType, Endpoint> = {
  [LlamaMarketType.Lend]: 'lending',
  [LlamaMarketType.Mint]: 'crvusd',
}

export const { useQuery: useBadDebtMarketsQuery } = queryFactory({
  queryKey: ({ type }: BadDebtParams) => ['getBadDebt', { type }, 'v1'] as const,
  queryFn: ({ type }: BadDebtParams) => getBadDebt({ endpoint: endpointFromMarketType[type] }),
  category: 'llamalend.market',
  validationSuite: EmptyValidationSuite,
})

export const useBadDebtMarket = ({
  type,
  blockchainId,
  controllerAddress,
}: BadDebtParams & {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}) => {
  const { data } = useBadDebtMarketsQuery({ type }, !!blockchainId && !!controllerAddress)

  return useMemo(() => {
    if (!blockchainId || !controllerAddress || !data?.length) return null

    const market = data.find(
      (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
    )

    // filter out market without bad debt (badDebt = 0)
    return market?.badDebt != null && market.badDebt > BAD_DEBT_THRESHOLD ? market.badDebt : null
  }, [blockchainId, controllerAddress, data])
}
