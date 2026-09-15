import { getUserLocks, type UserLock } from '@curvefi/prices-api/dao'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

export type UserLockFormatted = Omit<UserLock, 'amount' | 'lockedBalance'> & { amount: number; lockedBalance: number }

const _fetchUserLocks = async ({ userAddress }: { userAddress: string }): Promise<UserLockFormatted[]> => {
  const response = await getUserLocks(userAddress)

  return response.map(lock => ({
    ...lock,
    amount: Number(lock.amount) / 1e18,
    lockedBalance: Number(lock.lockedBalance) / 1e18,
  }))
}

export const { useQuery: useUserLocksQuery, invalidate: invalidateUserLocks } = queryFactory({
  queryKey: (params: { userAddress: string }) => ['user-locks', { userAddress: params.userAddress }] as const,
  queryFn: _fetchUserLocks,
  category: 'dao.user',
  validationSuite: EmptyValidationSuite,
})
