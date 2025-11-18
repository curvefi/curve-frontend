import { queryClient } from '@ui-kit/lib/api'
import { Address } from '@ui-kit/utils'
import { getBalanceQueryKey } from '@wagmi/core/query'

export const invalidateUserMarketQueries = ({
  marketId,
  userAddress,
}: {
  marketId: string | undefined
  userAddress: Address | undefined
}) => Promise.all([queryClient.invalidateQueries({ queryKey: getBalanceQueryKey({ address: userAddress }) })])
