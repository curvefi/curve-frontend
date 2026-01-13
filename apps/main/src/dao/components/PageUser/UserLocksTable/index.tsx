import lodash from 'lodash'
import { PaginatedTable } from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData } from '@/dao/components/PaginatedTable/TableRow'
import { type UserLockFormatted, invalidateUserLocks, useUserLocksQuery } from '@/dao/entities/user-locks'
import { useStore } from '@/dao/store/useStore'
import { SortDirection, UserLocksSortBy } from '@/dao/types/dao.types'
import { LockType } from '@curvefi/prices-api/dao/models'
import { formatLocaleDateFromTimestamp, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { LOCKS_LABELS } from '../constants'

interface UserLocksTableProps {
  userAddress: string
}

const sortUserLocks = (locks: UserLockFormatted[], sortBy: { key: UserLocksSortBy; order: SortDirection }) => {
  const { key, order } = sortBy
  return lodash.orderBy(locks, [key], [order])
}

const lockTypeLabel = (lockType: LockType) => {
  switch (lockType) {
    case 'CREATE_LOCK':
      return 'Create Lock'
    case 'WITHDRAW':
      return 'Withdraw'
    case 'INCREASE_LOCK_AMOUNT':
      return 'Increase Lock Amount'
    case 'INCREASE_UNLOCK_TIME':
      return 'Increase Unlock Time'
  }
}

export const UserLocksTable = ({ userAddress }: UserLocksTableProps) => {
  const { data: userLocks, isLoading, isError, isSuccess } = useUserLocksQuery({ userAddress })
  const userLocksSortBy = useStore((state) => state.user.userLocksSortBy)
  const setUserLocksSortBy = useStore((state) => state.user.setUserLocksSortBy)

  const gridTemplateColumns = '2fr 1fr 1fr 1fr'
  const minWidth = 36

  return (
    <PaginatedTable<UserLockFormatted>
      data={sortUserLocks(userLocks ?? [], userLocksSortBy)}
      minWidth={minWidth}
      isLoading={isLoading}
      isError={isError}
      isSuccess={isSuccess}
      columns={LOCKS_LABELS}
      sortBy={userLocksSortBy}
      errorMessage={t`An error occurred while fetching user locking activity.`}
      setSortBy={(key) => setUserLocksSortBy(key as UserLocksSortBy)}
      getData={() => invalidateUserLocks({ userAddress })}
      noDataMessage={t`No locking activity found for this user.`}
      gridTemplateColumns={gridTemplateColumns}
      renderRow={(lock, index) => (
        <TableRowWrapper key={index} columns={LOCKS_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableData className="align-left">{lockTypeLabel(lock.lockType)}</TableData>
          <TableData className={userLocksSortBy.key === 'amount' ? 'sortby-active right-padding' : 'right-padding'}>
            {formatNumber(Number(lock.amount))}
          </TableData>
          <TableData className={userLocksSortBy.key === 'timestamp' ? 'sortby-active right-padding' : 'right-padding'}>
            {formatLocaleDateFromTimestamp(lock.timestamp)}
          </TableData>
          <TableData className={userLocksSortBy.key === 'unlockTime' ? 'sortby-active right-padding' : 'right-padding'}>
            {lock.unlockTime ? formatLocaleDateFromTimestamp(lock.unlockTime) : '-'}
          </TableData>
        </TableRowWrapper>
      )}
    />
  )
}
