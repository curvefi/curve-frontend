import { useConnection } from 'wagmi'
import { useLlammaOhlcChartStateModel } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserPrices } from '@/llamalend/queries/user'
import { networks } from '@/loan/networks'
import { ChainId } from '@/loan/types/loan.types'
import { isPricesApiChain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui-kit/types/util'

type OhlcChartStateProps = {
  chainId: ChainId
  marketId: string
  previewPrices: Range<Decimal> | undefined
  controllerAddress: Address | undefined
  ammAddress: Address | undefined
}

export const useOhlcChartState = ({
  chainId,
  marketId,
  previewPrices,
  controllerAddress,
  ammAddress,
}: OhlcChartStateProps) => {
  const { address: userAddress } = useConnection()
  const { data: userPrices } = useUserPrices({ chainId, marketId, userAddress })
  const { data: oraclePrice } = useMarketOraclePrice({ chainId, marketId })
  const networkId = networks[chainId].id.toLowerCase()
  const network = isPricesApiChain(networkId) ? networkId : undefined
  return useLlammaOhlcChartStateModel({
    endpoint: 'crvusd',
    chainKey: chainId,
    marketId,
    network,
    controllerAddress,
    llammaAddress: ammAddress,
    oraclePrice,
    userPrices,
    previewPrices,
  })
}
