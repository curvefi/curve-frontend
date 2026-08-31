import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { AgeCell } from '../cells/AgeCell'
import { BaseApyCell, WeeklyBaseApyCell } from '../cells/BaseApyCell'
import { CrvApyCell } from '../cells/CrvApyCell'
import { NetApyCell } from '../cells/NetApyCell'
import { PointsCell } from '../cells/PointsCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsApyCell } from '../cells/RewardsApyCell'
import { TokensCell } from '../cells/TokensCell'
import { UsdCell } from '../cells/UsdCell'
import { getCrvApyRange, getNetApy, getRewardsApy } from '../cells/utils'
import { AgeHeaderTooltipContent } from '../header-tooltips/AgeHeaderTooltipContent'
import { BaseApyHeaderTooltipContent } from '../header-tooltips/BaseApyHeaderTooltipContent'
import { CrvApyHeaderTooltipContent } from '../header-tooltips/CrvApyHeaderTooltipContent'
import { NetApyHeaderTooltipContent } from '../header-tooltips/NetApyHeaderTooltipContent'
import { PointsHeaderTooltipContent } from '../header-tooltips/PointsHeaderTooltipContent'
import { PoolHeaderTooltipContent } from '../header-tooltips/PoolHeaderTooltipContent'
import { RewardsApyHeaderTooltipContent } from '../header-tooltips/RewardsApyHeaderTooltipContent'
import { TokensHeaderTooltipContent } from '../header-tooltips/TokensHeaderTooltipContent'
import { TvlHeaderTooltipContent } from '../header-tooltips/TvlHeaderTooltipContent'
import { VolumeHeaderTooltipContent } from '../header-tooltips/VolumeHeaderTooltipContent'
import type { PoolRow } from '../types'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

const columnHelper = createAppColumnHelper<PoolRow>()

export const POOL_COLUMNS = columnHelper.columns([
  columnHelper.accessor('name', {
    id: PoolColumnId.PoolName,
    header: POOL_TITLES[PoolColumnId.PoolName],
    cell: PoolTitleCell,
    meta: {
      tooltip: { title: POOL_TITLES[PoolColumnId.PoolName], body: <PoolHeaderTooltipContent /> },
    },
  }),
  columnHelper.accessor(getNetApy, {
    id: PoolColumnId.NetApy,
    header: POOL_TITLES[PoolColumnId.NetApy],
    cell: ({ row }) => <NetApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.NetApy], body: <NetApyHeaderTooltipContent /> },
    },
  }),
  columnHelper.accessor('baseDailyApr', {
    id: PoolColumnId.BaseApy,
    header: POOL_TITLES[PoolColumnId.BaseApy],
    cell: BaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.BaseApy], body: <BaseApyHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('baseWeeklyApr', {
    id: PoolColumnId.WeeklyBaseApy,
    header: POOL_TITLES[PoolColumnId.WeeklyBaseApy],
    cell: WeeklyBaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.WeeklyBaseApy], body: <BaseApyHeaderTooltipContent weekly /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(pool => (pool.gauge?.isKilled ? undefined : getCrvApyRange(pool)?.unboostedApy), {
    id: PoolColumnId.CrvApy,
    header: POOL_TITLES[PoolColumnId.CrvApy],
    cell: ({ row }) => <CrvApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.CrvApy], body: <CrvApyHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getRewardsApy, {
    id: PoolColumnId.RewardsApy,
    header: POOL_TITLES[PoolColumnId.RewardsApy],
    cell: ({ row }) => <RewardsApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.RewardsApy], body: <RewardsApyHeaderTooltipContent /> },
    },
  }),
  columnHelper.display({
    id: PoolColumnId.Points,
    header: POOL_TITLES[PoolColumnId.Points],
    cell: ({ row }) => <PointsCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.Points], body: <PointsHeaderTooltipContent /> },
    },
  }),
  columnHelper.display({
    id: PoolColumnId.Tokens,
    header: POOL_TITLES[PoolColumnId.Tokens],
    cell: ({ row }) => <TokensCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.Tokens], body: <TokensHeaderTooltipContent /> },
    },
  }),
  columnHelper.accessor('tradingVolume24h', {
    id: PoolColumnId.Volume,
    header: POOL_TITLES[PoolColumnId.Volume],
    cell: UsdCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.Volume], body: <VolumeHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('tvlUsd', {
    id: PoolColumnId.Tvl,
    header: POOL_TITLES[PoolColumnId.Tvl],
    cell: UsdCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.Tvl], body: <TvlHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('creationDate', {
    id: PoolColumnId.Age,
    header: POOL_TITLES[PoolColumnId.Age],
    cell: AgeCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.Age], body: <AgeHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
])
