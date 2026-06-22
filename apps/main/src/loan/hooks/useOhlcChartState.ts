import { useConnection } from 'wagmi'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type OhlcChartStateProps = {
  chainId: ChainId
  market: Llamma | null
  marketId: string
  previewPrices: Range<Decimal> | undefined
}

export const useOhlcChartState = ({ chainId, market, marketId, previewPrices }: OhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({ chainId, marketId, userAddress })
  const poolAddress = market?.address ?? ''
  const controllerAddress = market?.controller ?? ''
  const { data: oraclePrice } = useMarketOraclePrice({ chainId, marketId })
  const networkId = networks[chainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  return useLlammaOhlcChartStateModel({
    endpoint: 'crvusd',
    chainKey: chainId,
    marketId,
    network,
    controllerAddress,
    llammaAddress: poolAddress,
    oraclePrice,
    enabled: !!market,
    userPrices,
    previewPrices,
  })
}
