import { useConnection } from 'wagmi'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type UseOhlcChartStateProps = {
  rChainId: ChainId
  marketId: string | undefined
  previewPrices: Range<Decimal> | undefined
  controllerAddress: Address | undefined
  ammAddress: Address | undefined
}

export const useOhlcChartState = ({
  rChainId,
  marketId,
  previewPrices,
  ammAddress,
  controllerAddress,
}: UseOhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({ chainId: rChainId, marketId, userAddress })
  const { data: oraclePrice } = useMarketOraclePrice({ chainId: rChainId, marketId })
  const networkId = networks[rChainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  return useLlammaOhlcChartStateModel({
    endpoint: 'lending',
    chainKey: rChainId,
    marketId,
    network,
    controllerAddress,
    llammaAddress: ammAddress,
    oraclePrice,
    userPrices,
    previewPrices,
  })
}
