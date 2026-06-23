import type { ReactNode } from 'react'
import { type ColumnMeta, createColumnHelper } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { PoolListBaseApyCell } from '../cells/PoolListBaseApyCell'
import { PoolListRewards } from '../cells/PoolListRewards'
import { PoolListTitleCell } from '../cells/PoolListTitleCell'
import { PoolListUsdCell } from '../cells/PoolListUsdCell'
import type { PoolListItem } from '../poolList.types'
import { PoolListColumnId } from './column.enum'

type Tooltip = ColumnMeta<never, never>['tooltip']
type PoolListColumn = ColumnDefinition<PoolListItem>
type PoolListColumnOptions = Omit<PoolListColumn, 'id' | 'header'>

const columnHelper = createColumnHelper<PoolListItem>()

const createTooltip = (id: keyof typeof POOL_LIST_TITLES, body: ReactNode): Tooltip => ({
  title: POOL_LIST_TITLES[id],
  body,
})

const display = (id: PoolListColumnId, column: PoolListColumnOptions): PoolListColumn => ({
  ...column,
  id,
  header: POOL_LIST_TITLES[id],
})

const accessor = (
  id: PoolListColumnId,
  accessorFn: Parameters<typeof columnHelper.accessor>[0],
  column: PoolListColumnOptions,
): PoolListColumn =>
  columnHelper.accessor(accessorFn, {
    ...column,
    id,
    header: POOL_LIST_TITLES[id],
  })

export const POOL_LIST_TITLES: Record<PoolListColumnId, string> = {
  [PoolListColumnId.PoolName]: t`Pool`,
  [PoolListColumnId.RewardsBase]: t`Base vAPY`,
  [PoolListColumnId.RewardsOther]: t`Rewards tAPR`,
  [PoolListColumnId.Volume]: t`Volume`,
  [PoolListColumnId.Tvl]: t`TVL`,
}

export const POOL_LIST_COLUMNS = [
  accessor(PoolListColumnId.PoolName, 'name', {
    cell: PoolListTitleCell,
  }),
  accessor(PoolListColumnId.RewardsBase, 'baseDailyApy', {
    cell: PoolListBaseApyCell,
    meta: {
      type: 'numeric',
      tooltip: createTooltip(
        PoolListColumnId.RewardsBase,
        [
          t`Base variable APY (vAPY) is the annualized yield from trading fees based on the activity over the past 24h.`,
          t`If a pool holds a yield bearing asset, the intrinsic yield is added.`,
        ].join(' '),
      ),
    },
    sortUndefined: 'last',
  }),
  display(PoolListColumnId.RewardsOther, {
    cell: ({ row }) => <PoolListRewards pool={row.original} />,
    meta: { type: 'numeric', tooltip: { title: t`Token APR based on current prices of tokens and reward rates` } },
  }),
  accessor(PoolListColumnId.Volume, 'tradingVolume24h', {
    cell: PoolListUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  accessor(PoolListColumnId.Tvl, 'tvlUsd', {
    cell: PoolListUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
] satisfies PoolListColumn[]
