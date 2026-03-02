import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'
import { type GasInfo, type GasInfoQueryOptions, setGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'

export const setLlamaApi = (llamaApi: unknown) => (globalLibs.current.llamaApi = llamaApi as never)

export const resetLlamaTestContext = () => {
  queryClient.clear()
  globalLibs.current = {} as never
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
) => setGasInfoAndUpdateLib(params, info)
