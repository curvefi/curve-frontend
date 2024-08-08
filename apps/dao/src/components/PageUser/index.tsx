import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect } from 'react'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { copyToClipboard } from '@/utils'
import { formatDateFromTimestamp, convertToLocaleTimestamp, formatNumber } from '@/ui/utils'

import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import { ExternalLink } from '@/ui/Link'
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
  const {
    getUserEns,
    userMapper,
    getUserLocks,
    userLocksMapper,
    getUserProposalVotes,
    userProposalVotesMapper,
    userProposalVotesSortBy,
    setUserProposalVotesSortBy,
    userLocksSortBy,
    setUserLocksSortBy,
  } = useStore((state) => state.user)
  const { provider } = useStore((state) => state.wallet)

  const userAddress = rUserAddress.toLowerCase()

  const tableMinWidth = 41.875

  const userProposalVotes = userProposalVotesMapper[userAddress]?.votes ?? {}
  const userProposalVotesArray = Object.values(userProposalVotes)

  const holdersLoading = fetchStatus === 'LOADING'
  const holdersError = fetchStatus === 'ERROR'
  const holdersSuccess = fetchStatus === 'SUCCESS'

  const userLocksLoading = userLocksMapper[userAddress]
    ? userLocksMapper[userAddress]?.fetchingState === 'LOADING'
    : true
  const userLocksError = userLocksMapper[userAddress] ? userLocksMapper[userAddress]?.fetchingState === 'ERROR' : false
  const userLocksSuccess = userLocksMapper[userAddress]
    ? userLocksMapper[userAddress]?.fetchingState === 'SUCCESS'
    : false

  const userProposalVotesLoading = userProposalVotesMapper[userAddress]
    ? userProposalVotesMapper[userAddress].fetchingState === 'LOADING'
    : true
  const userProposalVotesError = userProposalVotesMapper[userAddress]
    ? userProposalVotesMapper[userAddress].fetchingState === 'ERROR'
    : false
  const userProposalVotesSuccess = userProposalVotesMapper[userAddress]
    ? userProposalVotesMapper[userAddress].fetchingState === 'SUCCESS'
    : false

  const LOCKS_LABELS: Column<UserLock>[] = [
    { key: 'date', label: 'Date' },
    { key: 'lock_type', label: 'Lock Type', disabled: true },
    { key: 'amount', label: 'Amount' },
    { key: 'unlock_time', label: 'Unlock Time', disabled: true },
  ]

  const VOTES_LABELS: Column<UserProposalVoteData>[] = [
    { key: 'vote_id', label: 'Vote ID' },
    { key: 'vote_type', label: 'Vote Type', disabled: true },
    { key: 'vote_for', label: 'For Weight' },
    { key: 'vote_against', label: 'Against Weight' },
    { key: 'vote_open', label: 'Vote Start' },
    { key: 'vote_close', label: 'Vote End' },
  ]

  const user: VeCrvHolder = allHolders[userAddress] || {
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

  // Get user ENS
  useEffect(() => {
    if (!userMapper[userAddress] && provider) {
      getUserEns(userAddress)
    }
  }, [getUserEns, userAddress, userMapper, provider])

  // Get user locks
  useEffect(() => {
    if (!userLocksMapper[userAddress] && userLocksLoading && !userLocksError) {
      getUserLocks(userAddress)
    }
  }, [getUserLocks, userAddress, userLocksMapper, userLocksLoading, userLocksError])

  // Get user ownership votes
  useEffect(() => {
    if (!userProposalVotesMapper[userAddress] && userProposalVotesLoading && !userProposalVotesError) {
      getUserProposalVotes(userAddress)
    }
  }, [getUserProposalVotes, userAddress, userProposalVotesLoading, userProposalVotesError, userProposalVotesMapper])

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
              <h3>{userMapper[userAddress]?.ens || userAddress}</h3>
              {userMapper[userAddress]?.ens && userAddress && (
                <Box flex flexAlignItems="center">
                  <p>{rUserAddress}</p>{' '}
                  <Box margin="0 0 0 var(--spacing-1)" flex>
                    <StyledCopyButton size="small" onClick={() => handleCopyClick(userAddress)}>
                      <Icon name="Copy" size={16} />
                    </StyledCopyButton>
                    <StyledExternalLink size="small" href={networks[1].scanAddressPath(userAddress)}>
                      <Icon name="Launch" size={16} />
                    </StyledExternalLink>
                  </Box>
                </Box>
              )}
            </Box>
            {!userMapper[userAddress]?.ens && (
              <Box flex margin="0 0 0 var(--spacing-1)">
                <StyledCopyButton size="small" onClick={() => handleCopyClick(userAddress)}>
                  <Icon name="Copy" size={16} />
                </StyledCopyButton>
                <StyledExternalLink size="small" href={networks[1].scanAddressPath(userAddress)}>
                  <Icon name="Launch" size={16} />
                </StyledExternalLink>
              </Box>
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
        <PaginatedTable<UserProposalVoteData>
          data={userProposalVotesArray}
          minWidth={tableMinWidth}
          fetchingState={userProposalVotesMapper[userAddress]?.fetchingState ?? 'LOADING'}
          columns={VOTES_LABELS}
          sortBy={userProposalVotesSortBy}
          title="Proposal Votes"
          errorMessage={t`An error occurred while fetching proposal votes.`}
          setSortBy={(key) => setUserProposalVotesSortBy(userAddress, key as UserProposalVotesSortBy)}
          getData={() => getUserProposalVotes(userAddress)}
          renderRow={(proposalVote, index) => (
            <TableRowWrapper key={index} columns={VOTES_LABELS.length} minWidth={tableMinWidth}>
              <TableData className={userProposalVotesSortBy.key === 'vote_id' ? 'active left-padding' : 'left-padding'}>
                #{proposalVote.vote_id}
              </TableData>
              <TableData className="left-padding capitalize">{proposalVote.vote_type}</TableData>
              <TableData
                className={userProposalVotesSortBy.key === 'vote_for' ? 'active left-padding' : 'left-padding'}
              >
                {formatNumber(proposalVote.vote_for, {
                  showDecimalIfSmallNumberOnly: true,
                })}
              </TableData>
              <TableData
                className={userProposalVotesSortBy.key === 'vote_against' ? 'active left-padding' : 'left-padding'}
              >
                {formatNumber(proposalVote.vote_against, {
                  showDecimalIfSmallNumberOnly: true,
                })}
              </TableData>
              <TableData
                className={userProposalVotesSortBy.key === 'vote_open' ? 'active left-padding' : 'left-padding'}
              >
                {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_open))}
              </TableData>
              <TableData
                className={userProposalVotesSortBy.key === 'vote_close' ? 'active left-padding' : 'left-padding'}
              >
                {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_close))}
              </TableData>
            </TableRowWrapper>
          )}
        />
        <PaginatedTable<UserLock>
          data={userLocksMapper[userAddress]?.locks ?? []}
          minWidth={tableMinWidth}
          fetchingState={userLocksMapper[userAddress]?.fetchingState ?? 'LOADING'}
          columns={LOCKS_LABELS}
          sortBy={userLocksSortBy}
          title="veCRV Locking Activity"
          errorMessage={t`An error occurred while fetching user locking activity.`}
          setSortBy={(key) => setUserLocksSortBy(userAddress, key as UserLocksSortBy)}
          getData={() => getUserLocks(userAddress.toLowerCase())}
          renderRow={(lock, index) => (
            <TableRowWrapper key={index} columns={LOCKS_LABELS.length} minWidth={tableMinWidth}>
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

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  &:hover {
    color: var(--button_icon--hover--color);
    opacity: 1;
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

export default UserPage
