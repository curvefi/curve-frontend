import { useEffect } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import useStore from '@/store/useStore'

import { GAUGE_VOTES_TABLE_LABELS } from './constants'

import { formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp, shortenTokenAddress } from '@/ui/utils/'

import PaginatedTable from '@/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/components/PaginatedTable/TableRow'

interface GaugeVotesTableProps {
  gaugeAddress: string
  tableMinWidth: number
}

const GaugeVotesTable = ({ gaugeAddress, tableMinWidth }: GaugeVotesTableProps) => {
  const { getGaugeVotes, gaugeVotesMapper, gaugeVotesSortBy, setGaugeVotesSortBy } = useStore((state) => state.gauges)
  const navigate = useNavigate()
  const gaugeVotes = gaugeVotesMapper[gaugeAddress]?.votes ?? []

  const gaugeVotesLoading = gaugeVotesMapper[gaugeAddress]
    ? gaugeVotesMapper[gaugeAddress].fetchingState === 'LOADING'
    : true
  const gaugeVotesError = gaugeVotesMapper[gaugeAddress]
    ? gaugeVotesMapper[gaugeAddress].fetchingState === 'ERROR'
    : false

  // Get user proposal votes
  useEffect(() => {
    if (!gaugeVotesMapper[gaugeAddress] && gaugeVotesLoading && !gaugeVotesError) {
      getGaugeVotes(gaugeAddress)
    }
  }, [getGaugeVotes, gaugeAddress, gaugeVotesLoading, gaugeVotesError, gaugeVotesMapper])

  return (
    <PaginatedTable<GaugeVoteData>
      data={gaugeVotes}
      minWidth={tableMinWidth}
      fetchingState={gaugeVotesMapper[gaugeAddress]?.fetchingState ?? 'LOADING'}
      columns={GAUGE_VOTES_TABLE_LABELS}
      sortBy={gaugeVotesSortBy}
      errorMessage={t`An error occurred while fetching proposal votes.`}
      setSortBy={(key) => setGaugeVotesSortBy(gaugeAddress, key as GaugeVotesSortBy)}
      getData={() => getGaugeVotes(gaugeAddress)}
      renderRow={(gaugeVote, index) => (
        <TableRowWrapper key={index} columns={GAUGE_VOTES_TABLE_LABELS.length} minWidth={tableMinWidth}>
          <TableData className={gaugeVotesSortBy.key === 'timestamp' ? 'sortby-active left-padding' : 'left-padding'}>
            {formatDateFromTimestamp(convertToLocaleTimestamp(gaugeVote.timestamp / 1000))}
          </TableData>
          <TableData className={gaugeVotesSortBy.key === 'weight' ? 'sortby-active left-padding' : 'left-padding'}>
            {formatNumber(gaugeVote.weight, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              navigate(`/ethereum/user/${gaugeVote.user}`)
            }}
            className="left-padding"
          >
            {shortenTokenAddress(gaugeVote.user)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default GaugeVotesTable
