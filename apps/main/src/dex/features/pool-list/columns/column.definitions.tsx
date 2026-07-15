import type { ReactNode } from 'react'
import { type ColumnMeta, createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { BaseApyCell } from '../cells/BaseApyCell'
import { PoolTitleCell } from '../cells/PoolTitleCell'
import { RewardsCell } from '../cells/RewardsCell'
import { UsdCell } from '../cells/UsdCell'
import type { PoolListItem } from '../pools.types'
import { PoolColumnId } from './columns.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type PoolColumn = ColumnDefinition<PoolListItem>
type PoolColumnOptions = Omit<PoolColumn, 'id' | 'header'>

const columnHelper = createColumnHelper<PoolListItem>()

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
  [PoolColumnId.RewardsBase]: t`Base vAPY`,
  [PoolColumnId.RewardsOther]: t`Rewards tAPR`,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

export const POOL_COLUMNS = [
  accessor(PoolColumnId.PoolName, 'name', {
    cell: PoolTitleCell,
  }),
  accessor(PoolColumnId.RewardsBase, 'baseDailyApr', {
    cell: BaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(
        PoolColumnId.RewardsBase,
        [
          t`Base variable APY (vAPY) is the annualized yield from trading fees based on the activity over the past 24h.`,
          t`If a pool holds a yield bearing asset, the intrinsic yield is added.`,
        ].join(' '),
      ),
    },
    sortUndefined: 'last',
  }),
  display(PoolColumnId.RewardsOther, {
    cell: ({ row }) => <RewardsCell pool={row.original} />,
    meta: { type: 'numeric', tooltip: { title: t`Token APR based on current prices of tokens and reward rates` } },
  }),
  accessor(PoolColumnId.Volume, 'tradingVolume24h', {
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(PoolColumnId.Tvl, 'tvlUsd', {
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
] satisfies PoolColumn[]
