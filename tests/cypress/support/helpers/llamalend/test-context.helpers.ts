import { globalLibs } from '@ui-kit/features/connect-wallet/lib/utils'
import { queryClient } from '@ui-kit/lib/api'

export const setLlamaApi = (llamaApi: unknown) => (globalLibs.current.llamaApi = llamaApi as never)

export const resetLlamaTestContext = () => {
  queryClient.clear()
  globalLibs.current = {} as never
  globalLibs.hydrated = {}
}
