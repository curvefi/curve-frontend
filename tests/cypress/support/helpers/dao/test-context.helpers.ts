import { globalLibs } from '@evm-ui/features/connect-wallet/lib/utils'
import { queryClient } from '@ui/features/queries/query-client'

export const setupMockedDaoComponentTest = () => {
  queryClient.clear()
  globalLibs.current = {}
  globalLibs.hydrated = {}
}
