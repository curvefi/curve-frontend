import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getTokens } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'
import { useLendMarket } from '../hooks/useLendMarket'

type LendingMarketTokens = ReturnType<typeof getTokens> | undefined

type UseOhlcChartStateProps = {
  rChainId: ChainId
  marketId: string
  previewPrices: Range<Decimal> | undefined
}

export const useOhlcChartState = ({ rChainId, marketId, previewPrices }: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({
    chainId: rChainId,
    marketId,
    userAddress,
  })
  const market = useLendMarket(rChainId, marketId).data
  const { data: oraclePrice } = useMarketOraclePrice({ chainId: rChainId, marketId })
  const networkId = networks[rChainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  const controllerAddress = market?.addresses.controller ?? ''
  const poolAddress = market?.addresses.amm ?? ''
  const chartState = useLlammaOhlcChartStateModel({
    endpoint: 'lending',
    chainKey: rChainId,
    marketId,
    network,
    controllerAddress,
    llammaAddress: poolAddress,
    oraclePrice,
    enabled: !!market,
    userPrices,
    previewPrices,
  })

  const coins: LendingMarketTokens = useMemo(() => market && getTokens(market), [market])

  return {
    coins,
    ...chartState,
  }
}
