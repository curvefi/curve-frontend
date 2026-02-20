import { sum } from 'lodash'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { boolFilterFn, inListFilterFn, multiFilterFn, rangeFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { PoolTitleCell } from '../cells/PoolTitleCell/PoolTitleCell'
import { RewardsBaseCell } from '../cells/RewardsBaseCell'
import { RewardsBaseHeader } from '../cells/RewardsBaseHeader'
import { RewardsOtherCell } from '../cells/RewardsOtherCell'
import { RewardsOtherHeader } from '../cells/RewardsOtherHeader'
import { UsdCell } from '../cells/UsdCell'
import type { PoolListItem } from '../types'
import { PoolColumnId } from './column.enum'

const columnHelper = createColumnHelper<PoolListItem>()

const headers = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.RewardsBase]: RewardsBaseHeader,
  [PoolColumnId.RewardsOther]: RewardsOtherHeader,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoolColumn = ColumnDef<PoolListItem, any>

/** Define a hidden column. */
const hidden = (
  accessor: Parameters<typeof columnHelper.accessor>[0],
  options?: Parameters<typeof columnHelper.accessor>[1],
) =>
  columnHelper.accessor(accessor, {
    ...options,
    meta: { ...options?.meta, hidden: true },
    sortUndefined: 'last',
  })

export const POOL_LIST_COLUMNS = [
  columnHelper.accessor('pool.name', {
    id: PoolColumnId.PoolName,
    header: t`Pool`,
    cell: PoolTitleCell,
  }),
  columnHelper.accessor((row) => (row.rewards?.base ? +row.rewards.base.day : null), {
    id: PoolColumnId.RewardsBase,
    header: headers[PoolColumnId.RewardsBase],
    cell: RewardsBaseCell,
    meta: {
      type: 'numeric',
      tooltip: {
        title: [
          t`Base variable APY (vAPY) is the annualized yield from trading fees based on the activity over the past 24h.`,
          t`If a pool holds a yield bearing asset, the intrinsic yield is added.`,
        ].join(' '),
      },
    },
  }),
  columnHelper.accessor('rewards', {
    id: PoolColumnId.RewardsOther,
    header: headers[PoolColumnId.RewardsOther],
    cell: RewardsOtherCell,
    enableSorting: false, // that's done in the separate columns RewardsCrv and RewardsIncentives
    enableMultiSort: false, // that's done in the separate columns RewardsCrv and RewardsIncentives
    meta: { type: 'numeric', tooltip: { title: t`Token APR based on current prices of tokens and reward rates` } },
  }),
  columnHelper.accessor((row) => (row.volume ? +row.volume?.value : null), {
    id: PoolColumnId.Volume,
    header: headers[PoolColumnId.Volume],
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor((row) => (row.tvl ? +row.tvl.value : null), {
    id: PoolColumnId.Tvl,
    header: headers[PoolColumnId.Tvl],
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  hidden(PoolColumnId.UserHasPositions, { id: PoolColumnId.UserHasPositions, filterFn: boolFilterFn }),
  hidden((p) => p.tags, { id: PoolColumnId.PoolTags, filterFn: inListFilterFn }),
  hidden((row) => row.rewards?.crv, { id: PoolColumnId.RewardsCrv, filterFn: multiFilterFn }),
  hidden((row) => (row.rewards ? sum(row.rewards.other) : undefined), {
    id: PoolColumnId.RewardsIncentives,
    filterFn: multiFilterFn,
  }),
] satisfies PoolColumn[]
