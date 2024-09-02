import { useEffect } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import useStore from '@/store/useStore'

import { GAUGE_VOTES_TABLE_LABELS } from './constants'
import { TOP_HOLDERS } from '@/constants'

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
  const gridTemplateColumns = '5.3125rem 1fr 1fr'

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
      setSortBy={(key) => {
        console.log('key', key)
        setGaugeVotesSortBy(gaugeAddress, key as GaugeVotesSortBy)
      }}
      getData={() => getGaugeVotes(gaugeAddress)}
      noDataMessage={t`No gauge weight votes found for this gauge.`}
      overflowYBreakpoint={tableMinWidth}
      gridTemplateColumns={gridTemplateColumns}
      renderRow={(gaugeVote, index) => (
        <TableRowWrapper
          key={index}
          columns={GAUGE_VOTES_TABLE_LABELS.length}
          gridTemplateColumns={gridTemplateColumns}
        >
          <TableData className={gaugeVotesSortBy.key === 'timestamp' ? 'sortby-active align-left' : 'align-left'}>
            {formatDateFromTimestamp(convertToLocaleTimestamp(gaugeVote.timestamp / 1000))}
          </TableData>
          <TableData className={gaugeVotesSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}>
            {formatNumber(gaugeVote.weight, {
              showDecimalIfSmallNumberOnly: true,
            })}
          </TableData>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              navigate(`/ethereum/user/${gaugeVote.user}`)
            }}
            className="right-padding"
          >
            {TOP_HOLDERS[gaugeVote.user.toLowerCase()]
              ? TOP_HOLDERS[gaugeVote.user.toLowerCase()].title
              : shortenTokenAddress(gaugeVote.user)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default GaugeVotesTable
