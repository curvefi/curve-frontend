import { useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@dao/store/useStore'

import { LOCKS_LABELS } from '../constants'

import { formatDateFromTimestamp, convertToLocaleTimestamp, formatNumber } from '@ui/utils'

import PaginatedTable from '@dao/components/PaginatedTable'
import { TableRowWrapper, TableData } from '@dao/components/PaginatedTable/TableRow'
import { UserLock, UserLocksSortBy, veCrvLockType } from '@dao/types/dao.types'

interface UserLocksTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserLocksTable = ({ userAddress, tableMinWidth }: UserLocksTableProps) => {
  const { getUserLocks, userLocksMapper, userLocksSortBy, setUserLocksSortBy } = useStore((state) => state.user)

  const gridTemplateColumns = '5.375rem 1fr 10rem 8rem'
  const minWidth = 36

  const userLocksLoading = userLocksMapper[userAddress]
    ? userLocksMapper[userAddress]?.fetchingState === 'LOADING'
    : true
  const userLocksError = userLocksMapper[userAddress] ? userLocksMapper[userAddress]?.fetchingState === 'ERROR' : false

  const lockTypeLabel = (lockType: veCrvLockType) => {
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

  // Get user locks
  useEffect(() => {
    if (!userLocksMapper[userAddress] && userLocksLoading && !userLocksError) {
      getUserLocks(userAddress)
    }
  }, [getUserLocks, userAddress, userLocksMapper, userLocksLoading, userLocksError])

  return (
    <PaginatedTable<UserLock>
      data={userLocksMapper[userAddress]?.locks ?? []}
      minWidth={minWidth}
      fetchingState={userLocksMapper[userAddress]?.fetchingState ?? 'LOADING'}
      columns={LOCKS_LABELS}
      sortBy={userLocksSortBy}
      errorMessage={t`An error occurred while fetching user locking activity.`}
      setSortBy={(key) => setUserLocksSortBy(userAddress, key as UserLocksSortBy)}
      getData={() => getUserLocks(userAddress.toLowerCase())}
      noDataMessage={t`No locking activity found for this user.`}
      gridTemplateColumns={gridTemplateColumns}
      renderRow={(lock, index) => (
        <TableRowWrapper key={index} columns={LOCKS_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableData className={userLocksSortBy.key === 'date' ? 'sortby-active align-left' : 'align-left'}>
            {formatDateFromTimestamp(convertToLocaleTimestamp(new Date(lock.date).getTime() / 1000))}
          </TableData>
          <TableData className="right-padding">{lockTypeLabel(lock.lock_type)}</TableData>
          <TableData className={userLocksSortBy.key === 'amount' ? 'sortby-active right-padding' : 'right-padding'}>
            {formatNumber(lock.amount, { showDecimalIfSmallNumberOnly: true })}
          </TableData>
          <TableData
            className={userLocksSortBy.key === 'unlock_time' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {lock.unlock_time ? formatDateFromTimestamp(convertToLocaleTimestamp(lock.unlock_time)) : '-'}
          </TableData>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserLocksTable
