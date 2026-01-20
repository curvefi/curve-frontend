import { useEffect } from 'react'
import { PaginatedTable } from '@/dao/components/PaginatedTable'
import { TableData, TableDataLink, TableRowWrapper } from '@/dao/components/PaginatedTable/TableRow'
import { TOP_HOLDERS } from '@/dao/constants'
import { useStore } from '@/dao/store/useStore'
import { GaugeVote, GaugeVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { formatLocaleDate } from '@ui/utils/'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { shortenAddress } from '@ui-kit/utils'
import { GAUGE_VOTES_TABLE_LABELS } from './constants'

interface GaugeVotesTableProps {
  gaugeAddress: string
  tableMinWidth: number
}

// weight is recieved in bps, 10000 = 100%
const weightBpsToPercentage = (weight: number) => weight / 100

export const GaugeVotesTable = ({ gaugeAddress, tableMinWidth }: GaugeVotesTableProps) => {
  const getGaugeVotes = useStore((state) => state.gauges.getGaugeVotes)
  const gaugeVotesMapper = useStore((state) => state.gauges.gaugeVotesMapper)
  const gaugeVotesSortBy = useStore((state) => state.gauges.gaugeVotesSortBy)
  const setGaugeVotesSortBy = useStore((state) => state.gauges.setGaugeVotesSortBy)
  const gaugeVotes = gaugeVotesMapper[gaugeAddress]?.votes ?? []
  const gridTemplateColumns = '7rem 1fr 1fr'

  const gaugeVotesLoading = gaugeVotesMapper[gaugeAddress]
    ? gaugeVotesMapper[gaugeAddress].fetchingState === 'LOADING'
    : true
  const gaugeVotesError = gaugeVotesMapper[gaugeAddress]
    ? gaugeVotesMapper[gaugeAddress].fetchingState === 'ERROR'
    : false
  const gaugeVotesSuccess = gaugeVotesMapper[gaugeAddress]
    ? gaugeVotesMapper[gaugeAddress].fetchingState === 'SUCCESS'
    : false

  // Get user proposal votes
  useEffect(() => {
    if (!gaugeVotesMapper[gaugeAddress] && gaugeVotesLoading && !gaugeVotesError) {
      void getGaugeVotes(gaugeAddress)
    }
  }, [getGaugeVotes, gaugeAddress, gaugeVotesLoading, gaugeVotesError, gaugeVotesMapper])

  return (
    <PaginatedTable<GaugeVote>
      title={t`GAUGE VOTES`}
      data={gaugeVotes}
      minWidth={tableMinWidth}
      isLoading={gaugeVotesLoading}
      isError={gaugeVotesError}
      isSuccess={gaugeVotesSuccess}
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
            {formatLocaleDate(gaugeVote.timestamp)}
          </TableData>
          <TableData className={gaugeVotesSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}>
            {weightBpsToPercentage(gaugeVote.weight)}%
          </TableData>
          <TableDataLink href={getEthPath(`${DAO_ROUTES.PAGE_USER}/${gaugeVote.user}`)} className="right-padding">
            {TOP_HOLDERS[gaugeVote.user.toLowerCase()]
              ? TOP_HOLDERS[gaugeVote.user.toLowerCase()].title
              : shortenAddress(gaugeVote.user)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}
