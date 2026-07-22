import type { ReactNode } from 'react'
import { type ColumnMeta, createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { BaseApyCell } from '../cells/BaseApyCell'
import { GaugeApyCell } from '../cells/GaugeApyCell'
import { NetApyCell } from '../cells/NetApyCell'
import { PointsCell } from '../cells/PointsCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsApyCell } from '../cells/RewardsApyCell'
import { UsdCell } from '../cells/UsdCell'
import {
  BaseApyHeaderTooltipContent,
  GaugeApyHeaderTooltipContent,
  NetApyHeaderTooltipContent,
  PointsHeaderTooltipContent,
  PoolHeaderTooltipContent,
  RewardsApyHeaderTooltipContent,
  TvlHeaderTooltipContent,
  VolumeHeaderTooltipContent,
} from '../header-tooltips'
import type { PoolRow } from '../types'
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

export const POOL_TITLES: Record<PoolColumnId, string> = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.NetApy]: t`Net APY`,
  [PoolColumnId.BaseApy]: t`Base APY`,
  [PoolColumnId.RewardsApy]: t`Rewards APY`,
  [PoolColumnId.GaugeApy]: t`Gauge APY`,
  [PoolColumnId.Points]: t`Points`,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

export const POOL_COLUMNS = [
  accessor(PoolColumnId.PoolName, 'name', {
    cell: PoolTitleCell,
    meta: { tooltip: createTooltip(PoolColumnId.PoolName, <PoolHeaderTooltipContent />) },
  }),
  display(PoolColumnId.NetApy, {
    cell: ({ row }) => <NetApyCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.NetApy, <NetApyHeaderTooltipContent />),
    },
  }),
  accessor(PoolColumnId.BaseApy, 'baseDailyApr', {
    cell: BaseApyCell,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.BaseApy, <BaseApyHeaderTooltipContent />),
    },
    sortUndefined: 'last',
  }),
  display(PoolColumnId.RewardsApy, {
    cell: ({ row }) => <RewardsApyCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.RewardsApy, <RewardsApyHeaderTooltipContent />),
    },
  }),
  display(PoolColumnId.GaugeApy, {
    cell: ({ row }) => <GaugeApyCell pool={row.original} />,
    enableSorting: false,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(PoolColumnId.GaugeApy, <GaugeApyHeaderTooltipContent />),
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
] satisfies PoolColumn[]
