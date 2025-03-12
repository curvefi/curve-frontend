import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PaginatedTable from '@/dao/components/PaginatedTable'
import { TableData, TableDataLink, TableRowWrapper } from '@/dao/components/PaginatedTable/TableRow'
import useStore from '@/dao/store/useStore'
import { UserProposalVoteData, UserProposalVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { convertToLocaleTimestamp, formatDateFromTimestamp, formatNumber } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { VOTES_LABELS } from '../constants'

interface UserProposalVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserProposalVotesTable = ({ userAddress, tableMinWidth }: UserProposalVotesTableProps) => {
  const getUserProposalVotes = useStore((state) => state.user.getUserProposalVotes)
  const userProposalVotesMapper = useStore((state) => state.user.userProposalVotesMapper)
  const userProposalVotesSortBy = useStore((state) => state.user.userProposalVotesSortBy)
  const setUserProposalVotesSortBy = useStore((state) => state.user.setUserProposalVotesSortBy)
  const { push } = useRouter()

  const gridTemplateColumns = '5.375rem 1fr 1fr 1fr 6rem 6rem'

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
      gridTemplateColumns={gridTemplateColumns}
      noDataMessage={t`No proposal votes found for this user.`}
      renderRow={(proposalVote, index) => (
        <TableRowWrapper key={index} columns={VOTES_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              push(
                getEthPath(
                  `${DAO_ROUTES.PAGE_PROPOSALS}/${proposalVote.vote_id}-${proposalVote.vote_type.toUpperCase()}`,
                ),
              )
            }}
            className={userProposalVotesSortBy.key === 'vote_id' ? 'sortby-active  align-left' : ' align-left'}
          >
            #{proposalVote.vote_id}
          </TableDataLink>
          <TableData className="right-padding capitalize">{proposalVote.vote_type}</TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_for' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatNumber(proposalVote.vote_for, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_against' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatNumber(proposalVote.vote_against, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_open' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_open))}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'vote_close' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.vote_close))}
          </TableData>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserProposalVotesTable
