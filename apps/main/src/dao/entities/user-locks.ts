import { getUserLocks } from '@curvefi/prices-api/dao/api'
import { UserLock } from '@curvefi/prices-api/dao/models'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

export type UserLockFormatted = Omit<UserLock, 'timestamp' | 'unlockTime' | 'amount' | 'lockedBalance'> & {
  timestamp: number
  unlockTime: number
  amount: number
  lockedBalance: number
}

const _fetchUserLocks = async ({ userAddress }: { userAddress: string }): Promise<UserLockFormatted[]> => {
  const response = await getUserLocks(userAddress)

  return response.map((lock) => ({
    ...lock,
    amount: Number(lock.amount) / 1e18,
    lockedBalance: Number(lock.lockedBalance) / 1e18,
    timestamp: new Date(lock.timestamp).getTime() / 1000,
    unlockTime: new Date(lock.unlockTime).getTime() / 1000,
  }))
}

export const { useQuery: useUserLocksQuery, invalidate: invalidateUserLocks } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-locks', { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserLocks,
  category: 'user',
  validationSuite: EmptyValidationSuite,
})
