import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PaginatedTable from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/dao/components/PaginatedTable/TableRow'
import useStore from '@/dao/store/useStore'
import { UserGaugeVote, UserGaugeVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { formatDateFromTimestamp, convertToLocaleTimestamp } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'
import { GAUGE_VOTES_LABELS } from '../constants'

interface UserGaugeVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserGaugeVotesTable = ({ userAddress, tableMinWidth }: UserGaugeVotesTableProps) => {
  const getUserGaugeVotes = useStore((state) => state.user.getUserGaugeVotes)
  const userGaugeVotesMapper = useStore((state) => state.user.userGaugeVotesMapper)
  const userGaugeVotesSortBy = useStore((state) => state.user.userGaugeVotesSortBy)
  const setUserGaugeVotesSortBy = useStore((state) => state.user.setUserGaugeVotesSortBy)
  const { push } = useRouter()

  const gridTemplateColumns = '5.375rem 1fr 1fr 1fr'

  const userGaugeVotesLoading = userGaugeVotesMapper[userAddress]
    ? userGaugeVotesMapper[userAddress]?.fetchingState === 'LOADING'
    : true
  const userGaugeVotesError = userGaugeVotesMapper[userAddress]
    ? userGaugeVotesMapper[userAddress]?.fetchingState === 'ERROR'
    : false

  // Get user locks
  useEffect(() => {
    if (!userGaugeVotesMapper[userAddress] && userGaugeVotesLoading && !userGaugeVotesError) {
      getUserGaugeVotes(userAddress)
    }
  }, [getUserGaugeVotes, userAddress, userGaugeVotesMapper, userGaugeVotesLoading, userGaugeVotesError])

  return (
    <PaginatedTable<UserGaugeVote>
      data={userGaugeVotesMapper[userAddress]?.votes ?? []}
      minWidth={tableMinWidth}
      fetchingState={userGaugeVotesMapper[userAddress]?.fetchingState ?? 'LOADING'}
      columns={GAUGE_VOTES_LABELS}
      sortBy={userGaugeVotesSortBy}
      errorMessage={t`An error occurred while fetching user gauge votes.`}
      setSortBy={(key) => setUserGaugeVotesSortBy(userAddress, key as UserGaugeVotesSortBy)}
      getData={() => getUserGaugeVotes(userAddress.toLowerCase())}
      noDataMessage={t`No gauge votes found for this user.`}
      gridTemplateColumns={gridTemplateColumns}
      renderRow={(gaugeVote, index) => (
        <TableRowWrapper key={index} columns={GAUGE_VOTES_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableData className={userGaugeVotesSortBy.key === 'timestamp' ? 'sortby-active align-left' : 'align-left'}>
            {formatDateFromTimestamp(convertToLocaleTimestamp(gaugeVote.timestamp / 1000))}
          </TableData>
          <TableData className="right-padding">{gaugeVote.gauge_name}</TableData>
          <TableData
            className={userGaugeVotesSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {(gaugeVote.weight / 100).toFixed(2)}%
          </TableData>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              push(getEthPath(`${DAO_ROUTES.PAGE_GAUGES}/${gaugeVote.gauge}`))
            }}
            className="right-padding"
          >
            {shortenAddress(gaugeVote.gauge)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserGaugeVotesTable
