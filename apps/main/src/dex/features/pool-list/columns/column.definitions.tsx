import { createAppColumnHelper } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { AgeCell } from '../cells/AgeCell'
import { BaseRateCell, WeeklyBaseRateCell } from '../cells/BaseRateCell'
import { CrvRateCell } from '../cells/CrvRateCell'
import { NetRateCell } from '../cells/NetRateCell'
import { PointsCell } from '../cells/PointsCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsRateCell } from '../cells/RewardsRateCell'
import { TokensCell } from '../cells/TokensCell'
import { UsdCell } from '../cells/UsdCell'
import { getCrvApyRange, getNetApy, getRewardsApr } from '../cells/utils'
import { AgeHeaderTooltipContent } from '../header-tooltips/AgeHeaderTooltipContent'
import { BaseRateHeaderTooltipContent } from '../header-tooltips/BaseRateHeaderTooltipContent'
import { CrvRateHeaderTooltipContent } from '../header-tooltips/CrvRateHeaderTooltipContent'
import { NetRateHeaderTooltipContent } from '../header-tooltips/NetRateHeaderTooltipContent'
import { PointsHeaderTooltipContent } from '../header-tooltips/PointsHeaderTooltipContent'
import { PoolHeaderTooltipContent } from '../header-tooltips/PoolHeaderTooltipContent'
import { RewardsRateHeaderTooltipContent } from '../header-tooltips/RewardsRateHeaderTooltipContent'
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
    cell: ({ row }) => <NetRateCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.NetApy], body: <NetRateHeaderTooltipContent /> },
    },
  }),
  columnHelper.accessor('baseDailyApr', {
    id: PoolColumnId.BaseApy,
    header: POOL_TITLES[PoolColumnId.BaseApy],
    cell: BaseRateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.BaseApy], body: <BaseRateHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor('baseWeeklyApr', {
    id: PoolColumnId.WeeklyBaseApy,
    header: POOL_TITLES[PoolColumnId.WeeklyBaseApy],
    cell: WeeklyBaseRateCell,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.WeeklyBaseApy], body: <BaseRateHeaderTooltipContent weekly /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(pool => (pool.gauge?.isKilled ? undefined : getCrvApyRange(pool)?.unboostedApy), {
    id: PoolColumnId.CrvApy,
    header: POOL_TITLES[PoolColumnId.CrvApy],
    cell: ({ row }) => <CrvRateCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.CrvApy], body: <CrvRateHeaderTooltipContent /> },
    },
    sortUndefined: 'last',
  }),
  columnHelper.accessor(getRewardsApr, {
    id: PoolColumnId.RewardsApy,
    header: POOL_TITLES[PoolColumnId.RewardsApy],
    cell: ({ row }) => <RewardsRateCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: { title: POOL_TITLES[PoolColumnId.RewardsApy], body: <RewardsRateHeaderTooltipContent /> },
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
