import { useEffect } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import useStore from '@/store/useStore'

import { VOTES_LABELS } from '../constants'

import { formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils/'

import PaginatedTable from '@/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/components/PaginatedTable/TableRow'

interface UserProposalVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserProposalVotesTable = ({ userAddress, tableMinWidth }: UserProposalVotesTableProps) => {
  const { getUserProposalVotes, userProposalVotesMapper, userProposalVotesSortBy, setUserProposalVotesSortBy } =
    useStore((state) => state.user)
  const navigate = useNavigate()

  const userProposalVotes = userProposalVotesMapper[userAddress]?.votes ?? {}
  const userProposalVotesArray = Object.values(userProposalVotes)

  const userProposalVotesLoading = userProposalVotesMapper[userAddress]
    ? userProposalVotesMapper[userAddress].fetchingState === 'LOADING'
    : true
  const userProposalVotesError = userProposalVotesMapper[userAddress]
    ? userProposalVotesMapper[userAddress].fetchingState === 'ERROR'
    : false

  // Get user proposal votes
  useEffect(() => {
    if (!userProposalVotesMapper[userAddress] && userProposalVotesLoading && !userProposalVotesError) {
      getUserProposalVotes(userAddress)
    }
  }, [getUserProposalVotes, userAddress, userProposalVotesLoading, userProposalVotesError, userProposalVotesMapper])

  return (
    <PaginatedTable<UserProposalVoteData>
      data={userProposalVotesArray}
      minWidth={tableMinWidth}
      fetchingState={userProposalVotesMapper[userAddress]?.fetchingState ?? 'LOADING'}
      columns={VOTES_LABELS}
      sortBy={userProposalVotesSortBy}
      errorMessage={t`An error occurred while fetching proposal votes.`}
      setSortBy={(key) => setUserProposalVotesSortBy(userAddress, key as UserProposalVotesSortBy)}
      getData={() => getUserProposalVotes(userAddress)}
      renderRow={(proposalVote, index) => (
        <TableRowWrapper key={index} columns={VOTES_LABELS.length} minWidth={tableMinWidth}>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              navigate(`/ethereum/proposals/${proposalVote.vote_id}-${proposalVote.vote_type.toUpperCase()}`)
            }}
            className={userProposalVotesSortBy.key === 'vote_id' ? 'sortby-active left-padding' : 'left-padding'}
          >
            #{proposalVote.vote_id}
          </TableDataLink>
          <TableData className="left-padding capitalize">{proposalVote.vote_type}</TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_for' ? 'sortby-active left-padding' : 'left-padding'}
          >
            {formatNumber(proposalVote.vote_for, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_against' ? 'sortby-active left-padding' : 'left-padding'}
          >
            {formatNumber(proposalVote.vote_against, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_open' ? 'sortby-active left-padding' : 'left-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_open))}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_close' ? 'sortby-active left-padding' : 'left-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_close))}
          </TableData>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserProposalVotesTable
