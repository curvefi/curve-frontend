import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { getBlockchainId } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type UseOhlcChartStateProps = {
  chainId: ChainId
  marketId: string | undefined
  previewPrices: Range<Decimal> | undefined
  controllerAddress: Address | undefined
  ammAddress: Address | undefined
}

export const useOhlcChartState = ({
  chainId,
  marketId,
  previewPrices,
  ammAddress,
  controllerAddress,
}: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const userPrices = useUserPrices({ chainId, marketId, userAddress })
  const { data: oraclePrice } = useMarketOraclePrice({ chainId, marketId })
  return useLlammaOhlcChartStateModel({
    endpoint: 'lending',
    chainKey: chainId,
    marketId,
    network: getBlockchainId(networks[chainId].id),
    controllerAddress,
    llammaAddress: ammAddress,
    oraclePrice,
    userPrices,
    previewPrices,
  })
}
