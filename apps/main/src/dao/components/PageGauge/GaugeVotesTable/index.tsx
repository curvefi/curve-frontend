import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PaginatedTable from '@/dao/components/PaginatedTable'
import { TableData, TableDataLink, TableRowWrapper } from '@/dao/components/PaginatedTable/TableRow'
import { TOP_HOLDERS } from '@/dao/constants'
import useStore from '@/dao/store/useStore'
import { GaugeVote, GaugeVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { convertToLocaleTimestamp, formatDateFromTimestamp, formatNumber } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'
import { GAUGE_VOTES_TABLE_LABELS } from './constants'

interface GaugeVotesTableProps {
  gaugeAddress: string
  tableMinWidth: number
}

const GaugeVotesTable = ({ gaugeAddress, tableMinWidth }: GaugeVotesTableProps) => {
  const getGaugeVotes = useStore((state) => state.gauges.getGaugeVotes)
  const gaugeVotesMapper = useStore((state) => state.gauges.gaugeVotesMapper)
  const gaugeVotesSortBy = useStore((state) => state.gauges.gaugeVotesSortBy)
  const setGaugeVotesSortBy = useStore((state) => state.gauges.setGaugeVotesSortBy)
  const { push } = useRouter()
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
    <PaginatedTable<GaugeVote>
      title={t`GAUGE VOTES`}
      data={gaugeVotes}
      minWidth={tableMinWidth}
      fetchingState={gaugeVotesMapper[gaugeAddress]?.fetchingState ?? 'LOADING'}
      columns={GAUGE_VOTES_TABLE_LABELS}
      sortBy={gaugeVotesSortBy}
      errorMessage={t`An error occurred while fetching proposal votes.`}
      setSortBy={(key) => {
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
            {formatNumber(gaugeVote.weight, { notation: 'compact' })}
          </TableData>
          <TableDataLink
            onClick={(e) => {
              e.preventDefault()
              push(getEthPath(`${DAO_ROUTES.PAGE_USER}/${gaugeVote.user}`))
            }}
            className="right-padding"
          >
            {TOP_HOLDERS[gaugeVote.user.toLowerCase()]
              ? TOP_HOLDERS[gaugeVote.user.toLowerCase()].title
              : shortenAddress(gaugeVote.user)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}

export default GaugeVotesTable
