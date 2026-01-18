import lodash from 'lodash'
import { useMemo } from 'react'
import { PaginatedTable } from '@/dao/components/PaginatedTable'
import { TableRowWrapper, TableData, TableDataLink } from '@/dao/components/PaginatedTable/TableRow'
import {
  type UserGaugeVoteFormatted,
  useUserGaugeVoteQuery,
  invalidateUserGaugeVoteQuery,
} from '@/dao/entities/user-gauge-votes'
import { useStore } from '@/dao/store/useStore'
import { SortDirection, UserGaugeVotesSortBy } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { formatLocaleDateFromTimestamp } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { formatNumber, shortenAddress } from '@ui-kit/utils'
import { GAUGE_VOTES_LABELS } from '../constants'

interface UserGaugeVotesTableProps {
  userAddress: string
  tableMinWidth: number
}

const sortUserGaugeVotes = (
  userGaugeVotes: UserGaugeVoteFormatted[],
  sortBy: { key: UserGaugeVotesSortBy; order: SortDirection },
) => {
  const { key, order } = sortBy
  return lodash.orderBy(userGaugeVotes, [key], [order])
}

export const UserGaugeVotesTable = ({ userAddress, tableMinWidth }: UserGaugeVotesTableProps) => {
  const { data: userGaugeVotes, isLoading, isError, isSuccess } = useUserGaugeVoteQuery({ userAddress })
  const userGaugeVotesSortBy = useStore((state) => state.user.userGaugeVotesSortBy)
  const setUserGaugeVotesSortBy = useStore((state) => state.user.setUserGaugeVotesSortBy)

  const gridTemplateColumns = '2fr 1fr 1fr 1fr'

  const sortedUserGaugeVotes = useMemo(
    () => sortUserGaugeVotes(userGaugeVotes ?? [], userGaugeVotesSortBy),
    [userGaugeVotes, userGaugeVotesSortBy],
  )

  return (
    <PaginatedTable<UserGaugeVoteFormatted>
      data={sortedUserGaugeVotes}
      minWidth={tableMinWidth}
      isLoading={isLoading}
      isError={isError}
      isSuccess={isSuccess}
      columns={GAUGE_VOTES_LABELS}
      sortBy={userGaugeVotesSortBy}
      errorMessage={t`An error occurred while fetching user gauge votes.`}
      setSortBy={(key) => setUserGaugeVotesSortBy(key as UserGaugeVotesSortBy)}
      getData={() => invalidateUserGaugeVoteQuery({ userAddress })}
      noDataMessage={t`No gauge votes found for this user.`}
      gridTemplateColumns={gridTemplateColumns}
      renderRow={(gaugeVote, index) => (
        <TableRowWrapper key={index} columns={GAUGE_VOTES_LABELS.length} gridTemplateColumns={gridTemplateColumns}>
          <TableData className="align-left">{gaugeVote.gaugeName}</TableData>
          <TableData className={`right-padding ${userGaugeVotesSortBy.key === 'timestamp' ? 'sortby-active' : ''}`}>
            {formatLocaleDateFromTimestamp(gaugeVote.timestamp)}
          </TableData>
          <TableData
            className={userGaugeVotesSortBy.key === 'weight' ? 'sortby-active right-padding' : 'right-padding'}
          >
            {formatNumber(gaugeVote.weight / 100, { unit: 'percentage', abbreviate: false })}
          </TableData>
          <TableDataLink href={getEthPath(`${DAO_ROUTES.PAGE_GAUGES}/${gaugeVote.gauge}`)} className="right-padding">
            {shortenAddress(gaugeVote.gauge)}
          </TableDataLink>
        </TableRowWrapper>
      )}
    />
  )
}
