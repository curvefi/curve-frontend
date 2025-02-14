import { useEffect } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { useNavigate } from 'react-router-dom'

import useStore from '@/dao/store/useStore'

import { GAUGE_VOTES_LABELS } from '../constants'

import { formatDateFromTimestamp, convertToLocaleTimestamp, shortenTokenAddress } from '@ui/utils'

import PaginatedTable from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/dao/components/PaginatedTable/TableRow'
import { UserGaugeVote, UserGaugeVotesSortBy } from '@/dao/types/dao.types'

interface UserGaugeVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserGaugeVotesTable = ({ userAddress, tableMinWidth }: UserGaugeVotesTableProps) => {
  const { getUserGaugeVotes, userGaugeVotesMapper, userGaugeVotesSortBy, setUserGaugeVotesSortBy } = useStore(
    (state) => state.user,
  )
  const navigate = useNavigate()

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
              navigate(`/ethereum/gauges/${gaugeVote.gauge}`)
            }}
            className="right-padding"
          >
            {shortenTokenAddress(gaugeVote.gauge)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserGaugeVotesTable
