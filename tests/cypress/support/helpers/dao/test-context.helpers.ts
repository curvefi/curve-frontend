import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { queryClient } from '@evm-ui/lib/api'

export const setupMockedDaoComponentTest = () => {
  queryClient.clear()
  globalLibs.current = {}
  globalLibs.hydrated = {}
}
