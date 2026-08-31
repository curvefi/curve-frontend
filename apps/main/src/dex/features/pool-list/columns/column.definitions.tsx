import type { ReactNode } from 'react'
import type { ColumnDefinition } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { type ColumnMeta, createColumnHelper } from '@tanstack/react-table'
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

type Tooltip = ColumnMeta<never, never>['tooltip']
type PoolColumn = ColumnDefinition<PoolRow>
type PoolColumnOptions = Omit<PoolColumn, 'id' | 'header'>

const columnHelper = createColumnHelper<PoolRow>()

const createTooltip = (id: keyof typeof POOL_TITLES, body: ReactNode): Tooltip => ({
  title: POOL_TITLES[id],
  body,
})

const display = (id: PoolColumnId, column: PoolColumnOptions): PoolColumn => ({
  ...column,
  id,
  header: POOL_TITLES[id],
})

const accessor = (
  id: PoolColumnId,
  accessorFn: Parameters<typeof columnHelper.accessor>[0],
  column: PoolColumnOptions,
): PoolColumn =>
  columnHelper.accessor(accessorFn, {
    ...column,
    id,
    header: POOL_TITLES[id],
  })

export const POOL_COLUMNS = [
  accessor(PoolColumnId.PoolName, 'name', {
    cell: PoolTitleCell,
    meta: { tooltip: createTooltip(PoolColumnId.PoolName, <PoolHeaderTooltipContent />) },
  }),
  accessor(PoolColumnId.NetApy, getNetApy, {
    cell: ({ row }) => <NetApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.NetApy, <NetApyHeaderTooltipContent />),
    },
  }),
  accessor(PoolColumnId.BaseApy, 'baseDailyApr', {
    cell: BaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.BaseApy, <BaseApyHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.WeeklyBaseApy, 'baseWeeklyApr', {
    cell: WeeklyBaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.WeeklyBaseApy, <BaseApyHeaderTooltipContent weekly />),
    },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.CrvApy, pool => (pool.gauge?.isKilled ? undefined : getCrvApyRange(pool)?.unboostedApy), {
    cell: ({ row }) => <CrvApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.CrvApy, <CrvApyHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.RewardsApy, getRewardsApy, {
    cell: ({ row }) => <RewardsApyCell pool={row.original} />,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.RewardsApy, <RewardsApyHeaderTooltipContent />),
    },
  }),
  display(PoolColumnId.Points, {
    cell: ({ row }) => <PointsCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.Points, <PointsHeaderTooltipContent />),
    },
  }),
  display(PoolColumnId.Tokens, {
    cell: ({ row }) => <TokensCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.Tokens, <TokensHeaderTooltipContent />),
    },
  }),
  accessor(PoolColumnId.Volume, 'tradingVolume24h', {
    cell: UsdCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.Volume, <VolumeHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.Tvl, 'tvlUsd', {
    cell: UsdCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.Tvl, <TvlHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.Age, 'creationDate', {
    cell: AgeCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.Age, <AgeHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
] satisfies PoolColumn[]
