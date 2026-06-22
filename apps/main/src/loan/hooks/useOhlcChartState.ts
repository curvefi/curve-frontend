import { useConnection } from 'wagmi'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getAmmAddress, getControllerAddress } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { networks } from '@/loan/networks'
import { ChainId, Llamma } from '@/loan/types/loan.types'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type OhlcChartStateProps = {
  chainId: ChainId
  market: Llamma | null
  previewPrices: Range<Decimal> | undefined
}

export const useOhlcChartState = ({ chainId, market, previewPrices }: OhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({ chainId, userAddress })
  const { data: oraclePrice } = useMarketOraclePrice({ chainId })
  return useLlammaOhlcChartStateModel({
    endpoint: 'crvusd',
    chainKey: chainId,
    marketId: market?.id,
    network: getBlockchainId(networks[chainId].id),
    controllerAddress: getControllerAddress(market),
    llammaAddress: getAmmAddress(market),
    oraclePrice,
    enabled: !!market,
    userPrices,
    previewPrices,
  })
}
