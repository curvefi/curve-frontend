import { pick } from 'lodash'
import { useUserFullPoolPositions } from '@/dex/queries/user-full-pool-positions.query'
import { useUserLitePoolPositions } from '@/dex/queries/user-lite-pool-positions.query'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import type { UserChainParams } from '@evm-ui/queries/query-types'
import type { QueryData } from '@ui/features/queries/util'

export function useUserPoolPositions(params: UserChainParams, enabled?: boolean) {
  const isLite = params.chainId != null && isLiteChain(params.chainId)

  // Can't use q() because of union type trouble, and on top of that we need isFetching as well.
  return pick(
    {
      true: useUserLitePoolPositions(params, isLite && enabled),
      false: useUserFullPoolPositions(params, !isLite && enabled),
    }[`${isLite}`],
    'data',
    'error',
    'isLoading',
    'isFetching',
  )
}

export type UserPoolPositions = QueryData<typeof useUserPoolPositions>
export type UserPoolPosition = UserPoolPositions[number]
