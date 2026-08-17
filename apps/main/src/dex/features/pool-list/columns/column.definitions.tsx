import type { ReactNode } from 'react'
import { type ColumnMeta, createColumnHelper } from '@tanstack/react-table'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { AgeCell } from '../cells/AgeCell'
import { BaseApyCell, WeeklyBaseApyCell } from '../cells/BaseApyCell'
import { CrvApyCell } from '../cells/CrvApyCell'
import { NetApyCell } from '../cells/NetApyCell'
import { PointsCell } from '../cells/PointsCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsApyCell } from '../cells/RewardsApyCell'
import { UsdCell } from '../cells/UsdCell'
import { AgeHeaderTooltipContent } from '../header-tooltips/AgeHeaderTooltipContent'
import { BaseApyHeaderTooltipContent } from '../header-tooltips/BaseApyHeaderTooltipContent'
import { CrvApyHeaderTooltipContent } from '../header-tooltips/CrvApyHeaderTooltipContent'
import { NetApyHeaderTooltipContent } from '../header-tooltips/NetApyHeaderTooltipContent'
import { PointsHeaderTooltipContent } from '../header-tooltips/PointsHeaderTooltipContent'
import { PoolHeaderTooltipContent } from '../header-tooltips/PoolHeaderTooltipContent'
import { RewardsApyHeaderTooltipContent } from '../header-tooltips/RewardsApyHeaderTooltipContent'
import { TvlHeaderTooltipContent } from '../header-tooltips/TvlHeaderTooltipContent'
import { VolumeHeaderTooltipContent } from '../header-tooltips/VolumeHeaderTooltipContent'
import type { PoolRow } from '../types'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type PoolColumn = ColumnDefinition<PoolRow>
type PoolColumnOptions = Omit<PoolColumn, 'id' | 'header'>

const columnHelper = createColumnHelper<PoolRow>()

// TanStack requires an accessorFn for sorting controls, even when it's a computed value rather than a direct property; manualSorting leaves ordering to the v2 pools API on full networks.
const serverSortableAccessor = () => 0

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

const createPoolColumns = ({ isLite }: { isLite: boolean }) =>
  [
    accessor(PoolColumnId.PoolName, 'name', {
      cell: PoolTitleCell,
      meta: { tooltip: createTooltip(PoolColumnId.PoolName, <PoolHeaderTooltipContent />) },
    }),
    accessor(PoolColumnId.NetApy, serverSortableAccessor, {
      cell: ({ row }) => <NetApyCell pool={row.original} />,
      enableSorting: !isLite,
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
    accessor(PoolColumnId.CrvApy, serverSortableAccessor, {
      cell: ({ row }) => <CrvApyCell pool={row.original} />,
      enableSorting: !isLite,
      meta: {
        type: 'numeric',
        tooltip: createTooltip(PoolColumnId.CrvApy, <CrvApyHeaderTooltipContent />),
      },
    }),
    accessor(PoolColumnId.RewardsApy, serverSortableAccessor, {
      cell: ({ row }) => <RewardsApyCell pool={row.original} />,
      enableSorting: !isLite,
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

export const POOL_COLUMNS = createPoolColumns({ isLite: false })
export const LITE_POOL_COLUMNS = createPoolColumns({ isLite: true })
