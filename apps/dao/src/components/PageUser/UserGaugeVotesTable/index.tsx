import { useEffect } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import useStore from '@/store/useStore'

import { GAUGE_VOTES_LABELS } from '../constants'

import { formatDateFromTimestamp, convertToLocaleTimestamp, shortenTokenAddress } from '@/ui/utils'

import PaginatedTable from '@/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/components/PaginatedTable/TableRow'

interface UserGaugeVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const UserGaugeVotesTable = ({ userAddress, tableMinWidth }: UserGaugeVotesTableProps) => {
  const { getUserGaugeVotes, userGaugeVotesMapper, userGaugeVotesSortBy, setUserGaugeVotesSortBy } = useStore(
    (state) => state.user
  )
  const navigate = useNavigate()

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
    <PaginatedTable<UserGaugeVoteData>
      data={userGaugeVotesMapper[userAddress]?.votes ?? []}
      minWidth={tableMinWidth}
      fetchingState={userGaugeVotesMapper[userAddress]?.fetchingState ?? 'LOADING'}
      columns={GAUGE_VOTES_LABELS}
      sortBy={userGaugeVotesSortBy}
      errorMessage={t`An error occurred while fetching user gauge votes.`}
      setSortBy={(key) => setUserGaugeVotesSortBy(userAddress, key as UserGaugeVotesSortBy)}
      getData={() => getUserGaugeVotes(userAddress.toLowerCase())}
      renderRow={(gaugeVote, index) => (
        <TableRowWrapper key={index} columns={GAUGE_VOTES_LABELS.length} minWidth={tableMinWidth}>
          <TableData
            className={userGaugeVotesSortBy.key === 'timestamp' ? 'sortby-active left-padding' : 'left-padding'}
          >
            {formatDateFromTimestamp(convertToLocaleTimestamp(gaugeVote.timestamp / 1000))}
          </TableData>
          <TableData className="left-padding">{gaugeVote.gauge_name}</TableData>
          <TableData className={userGaugeVotesSortBy.key === 'weight' ? 'sortby-active left-padding' : 'left-padding'}>
            {(gaugeVote.weight / 100).toFixed(2)}%
          </TableData>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              navigate(`/ethereum/gauges/${gaugeVote.gauge}`)
            }}
            className="left-padding"
          >
            {shortenTokenAddress(gaugeVote.gauge)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default UserGaugeVotesTable
