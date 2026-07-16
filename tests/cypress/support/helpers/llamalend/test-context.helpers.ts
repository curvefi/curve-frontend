import { ethAddress } from 'viem'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'
import { type GasInfo, type GasInfoQueryOptions, setGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { getTokenUsdRateKey } from '@ui-kit/lib/model/entities/token-usd-rate'

export const llamaNetworks = loanNetworks as unknown as NetworkDict<LlamaChainId>

export const setLlamaApi = (llamaApi: unknown) => (globalLibs.current.llamaApi = llamaApi as never)

export const resetLlamaTestContext = () => {
  queryClient.clear()
  globalLibs.current = {}
  globalLibs.hydrated = {}
}

export const setGasInfo = (
  params: GasInfoQueryOptions,
  info: GasInfo = {
    gasPrice: 160000000,
    priority: [98000000, 89000000, 79000000, 59000000],
    max: [220000000, 210000000, 200000000, 180000000],
    basePlusPriority: [156794470, 147794470, 137794470, 117794470],
  },
  ethPrice = 1,
) => {
  queryClient.setQueryData(getTokenUsdRateKey({ chainId: params.chainId, tokenAddress: ethAddress }), ethPrice)
  return setGasInfoAndUpdateLib(params, info)
}
