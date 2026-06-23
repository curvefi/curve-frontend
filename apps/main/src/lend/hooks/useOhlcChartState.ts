import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { getAmmAddress, getControllerAddress } from '@/llamalend/llama.utils'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type UseOhlcChartStateProps = {
  rChainId: ChainId
  market: LendMarketTemplate | undefined
  previewPrices: Range<Decimal> | undefined
}

export const useOhlcChartState = ({ rChainId, market, previewPrices }: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({
    chainId: rChainId,
    marketId: market?.id,
    userAddress,
  })
  const { data: oraclePrice } = useMarketOraclePrice({ chainId: rChainId, marketId: market?.id })
  return useLlammaOhlcChartStateModel({
    endpoint: 'lending',
    chainKey: rChainId,
    marketId: market?.id,
    network: getBlockchainId(networks[rChainId].id),
    controllerAddress: getControllerAddress(market),
    llammaAddress: getAmmAddress(market),
    oraclePrice,
    enabled: !!market,
    userPrices,
    previewPrices,
  })
}
