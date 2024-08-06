import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'
import { ethers } from 'ethers'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { copyToClipboard } from '@/utils'
import { shortenTokenAddress, formatDateFromTimestamp, convertToLocaleTimestamp, formatNumber } from '@/ui/utils'

import SpinnerComponent from '../Spinner'
import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import UserLocks from './UserLocks'
import IconButton from '@/ui/IconButton'
import PaginatedTable, { Column } from '../PaginatedTable'
import { TableRowWrapper, TableData } from '../PaginatedTable/TableRow'

type Props = {
  routerParams: {
    rUserAddress: string
  }
}

const UserPage = ({ routerParams: { rUserAddress } }: Props) => {
  const {
    veCrvHolders: { allHolders, fetchStatus },
    getVeCrvHolders,
  } = useStore((state) => state.vecrv)
  const { getUserEns, userMapper, getUserLocks, userLocksMapper, userLocksSortBy, setUserLocksSortBy } = useStore(
    (state) => state.user
  )
  const { provider } = useStore((state) => state.wallet)

  const tableMinWidth = 41.875

  const holdersLoading = fetchStatus === 'LOADING'
  const holdersError = fetchStatus === 'ERROR'
  const holdersSuccess = fetchStatus === 'SUCCESS'

  const locksLabel: Column<UserLock>[] = [
    { key: 'date', label: 'Date' },
    { key: 'lock_type', label: 'Lock Type', disabled: true },
    { key: 'amount', label: 'Amount' },
    { key: 'unlock_time', label: 'Unlock Time', disabled: true },
  ]

  const user: VeCrvHolder = allHolders[rUserAddress] || {
    user: rUserAddress,
    locked: 0,
    unlock_time: 0,
    weight: 0,
    weight_ratio: 0,
  }

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  useEffect(() => {
    if (Object.keys(allHolders).length === 0 && holdersLoading && !holdersError) {
      getVeCrvHolders()
    }
  }, [getVeCrvHolders, allHolders, holdersLoading, holdersError])

  useEffect(() => {
    if (!userMapper[rUserAddress] && provider) {
      getUserEns(rUserAddress)
    }
  }, [getUserEns, rUserAddress, userMapper, provider])

  useEffect(() => {
    if (!userLocksMapper[rUserAddress]) {
      getUserLocks(rUserAddress)
    }
  }, [getUserLocks, rUserAddress, userLocksMapper])

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

  return (
    <Wrapper>
      <UserPageContainer variant="secondary">
        <UserHeader variant="secondary">
          <Box flex flexAlignItems="center">
            <Box flex flexColumn flexJustifyContent="center">
              <h3>{userMapper[rUserAddress]?.ens || rUserAddress}</h3>
              {userMapper[rUserAddress]?.ens && rUserAddress && (
                <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
                  <p>{rUserAddress}</p>{' '}
                  <StyledCopyButton size="small" onClick={() => handleCopyClick(rUserAddress)}>
                    <Icon name="Copy" size={16} />
                  </StyledCopyButton>
                </Box>
              )}
            </Box>
            {!userMapper[rUserAddress]?.ens && (
              <StyledCopyButton size="small" onClick={() => handleCopyClick(rUserAddress)}>
                <Icon name="Copy" size={16} />
              </StyledCopyButton>
            )}
          </Box>
        </UserHeader>
        <UserStats>
          <SubTitleColumn
            loading={holdersLoading}
            title={t`veCRV`}
            data={
              <SubTitleColumnData>
                {formatNumber(user.weight, { showDecimalIfSmallNumberOnly: true })}
              </SubTitleColumnData>
            }
          />
          <SubTitleColumn
            loading={holdersLoading}
            title={t`Locked CRV`}
            data={
              <SubTitleColumnData>
                {formatNumber(user.locked, { showDecimalIfSmallNumberOnly: true })}
              </SubTitleColumnData>
            }
          />
          <SubTitleColumn
            loading={holdersLoading}
            title={t`Weight Ratio`}
            data={<SubTitleColumnData>{formatNumber(user.weight_ratio)}%</SubTitleColumnData>}
          />
          <SubTitleColumn
            loading={holdersLoading}
            title={t`Unlock Time`}
            data={
              <SubTitleColumnData>
                {user.unlock_time
                  ? formatDateFromTimestamp(convertToLocaleTimestamp(new Date(user.unlock_time).getTime()))
                  : 'N/A'}
              </SubTitleColumnData>
            }
          />
        </UserStats>
        <PaginatedTable<UserLock>
          data={userLocksMapper[rUserAddress]?.locks ?? []}
          minWidth={tableMinWidth}
          fetchingState={userLocksMapper[rUserAddress]?.fetchingState ?? 'LOADING'}
          columns={locksLabel}
          sortBy={userLocksSortBy}
          title="veCRV Locking Activity"
          errorMessage={t`Error fetching locks`}
          setSortBy={(key) => setUserLocksSortBy(rUserAddress, key as UserLocksSortBy)}
          getData={() => getUserLocks(rUserAddress)}
          renderRow={(lock, index) => (
            <TableRowWrapper key={index} columns={locksLabel.length} minWidth={tableMinWidth}>
              <TableData className={userLocksSortBy.key === 'date' ? 'active left-padding' : 'left-padding'}>
                {formatDateFromTimestamp(convertToLocaleTimestamp(new Date(lock.date).getTime() / 1000))}
              </TableData>
              <TableData className="left-padding">{lockTypeLabel(lock.lock_type)}</TableData>
              <TableData className={userLocksSortBy.key === 'amount' ? 'active left-padding' : 'left-padding'}>
                {formatNumber(lock.amount, { showDecimalIfSmallNumberOnly: true })}
              </TableData>
              <TableData className="left-padding">
                {lock.unlock_time ? formatDateFromTimestamp(convertToLocaleTimestamp(lock.unlock_time)) : '-'}
              </TableData>
            </TableRowWrapper>
          )}
        />
      </UserPageContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  gap: var(--spacing-2);
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const UserPageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  width: 100%;
`

const UserHeader = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const UserStats = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-4);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

const StyledCopyButton = styled(IconButton)`
  &:hover {
    color: var(--button_icon--hover--color);
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

export default UserPage
