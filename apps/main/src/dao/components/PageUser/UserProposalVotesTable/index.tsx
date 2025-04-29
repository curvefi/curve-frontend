import { orderBy } from 'lodash'
import { useRouter } from 'next/navigation'
import PaginatedTable from '@/dao/components/PaginatedTable'
import { TableData, TableDataLink, TableRowWrapper } from '@/dao/components/PaginatedTable/TableRow'
import {
  type UserProposalVoteFormatted,
  useUserProposalVotesQuery,
  invalidateUserProposalVotesQuery,
} from '@/dao/entities/user-proposal-votes'
import useStore from '@/dao/store/useStore'
import { SortDirection, UserProposalVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { convertToLocaleTimestamp, formatDateFromTimestamp, formatNumber } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { VOTES_LABELS } from '../constants'

interface UserProposalVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const sortUserProposalVotes = (
  userProposalVotes: UserProposalVoteFormatted[],
  sortBy: { key: UserProposalVotesSortBy; order: SortDirection },
) => {
  const { key, order } = sortBy
  return orderBy(userProposalVotes, [key], [order])
}

const UserProposalVotesTable = ({ userAddress, tableMinWidth }: UserProposalVotesTableProps) => {
  const {
    data: userProposalVotes,
    isLoading: userProposalVotesLoading,
    isError: userProposalVotesError,
    isSuccess: userProposalVotesSuccess,
  } = useUserProposalVotesQuery({
    userAddress,
  })
  const userProposalVotesSortBy = useStore((state) => state.user.userProposalVotesSortBy)
  const setUserProposalVotesSortBy = useStore((state) => state.user.setUserProposalVotesSortBy)
  const { push } = useRouter()

  const gridTemplateColumns = '5.375rem 1fr 1fr 1fr 1fr 1fr'

  const userProposalVotesArray = Object.values(userProposalVotes ?? {})

  return (
    <PaginatedTable<UserProposalVoteFormatted>
      data={sortUserProposalVotes(userProposalVotesArray, userProposalVotesSortBy)}
      minWidth={tableMinWidth}
      isLoading={userProposalVotesLoading}
      isError={userProposalVotesError}
      isSuccess={userProposalVotesSuccess}
      columns={VOTES_LABELS}
      sortBy={userProposalVotesSortBy}
      errorMessage={t`An error occurred while fetching proposal votes.`}
      setSortBy={(key) => setUserProposalVotesSortBy(key as UserProposalVotesSortBy)}
      getData={() => invalidateUserProposalVotesQuery({ userAddress })}
      gridTemplateColumns={gridTemplateColumns}
      noDataMessage={t`No proposal votes found for this user.`}
      renderRow={(proposalVote, index) => (
        <TableRowWrapper key={index} columns={VOTES_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              push(
                getEthPath(
                  `${DAO_ROUTES.PAGE_PROPOSALS}/${proposalVote.voteId}-${proposalVote.voteType.toUpperCase()}`,
                ),
              )
            }}
            className={userProposalVotesSortBy.key === 'voteId' ? 'sortby-active  align-left' : ' align-left'}
          >
            #{proposalVote.voteId}
          </TableDataLink>
          <TableData className="right-padding capitalize">{proposalVote.voteType}</TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'voteFor' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatNumber(proposalVote.voteFor, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'voteAgainst' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatNumber(proposalVote.voteAgainst, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'voteOpen' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.voteOpen))}
          </TableData>
          <TableData
            className={userProposalVotesSortBy.key === 'voteClose' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(proposalVote.voteClose))}
          </TableData>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserProposalVotesTable
