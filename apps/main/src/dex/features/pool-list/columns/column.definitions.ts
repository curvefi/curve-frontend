import { sumBy } from 'lodash'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef, Row } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { boolFilterFn, inListFilterFn, multiFilterFn, rangeFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { PoolTitleCell } from '../cells/PoolTitleCell/PoolTitleCell'
import { RewardsBaseCell } from '../cells/RewardsBaseCell'
import { RewardsBaseHeader } from '../cells/RewardsBaseHeader'
import { RewardsCrvCell } from '../cells/RewardsCrvCell'
import { RewardsIncentivesCell } from '../cells/RewardsIncentivesCell'
import { RewardsOtherCell } from '../cells/RewardsOtherCell'
import { RewardsOtherHeader } from '../cells/RewardsOtherHeader'
import { UsdCell } from '../cells/UsdCell'
import type { PoolListItem } from '../types'
import { PoolColumnId } from './column.enum'

const columnHelper = createColumnHelper<PoolListItem>()

const headers = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.RewardsBase]: RewardsBaseHeader,
  [PoolColumnId.RewardsCrv]: t`CRV APR`,
  [PoolColumnId.RewardsIncentives]: t`Incentives APR`,
  [PoolColumnId.RewardsOther]: RewardsOtherHeader,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoolColumn = ColumnDef<PoolListItem, any>

/** Sorts pool rows by a numeric reward value, placing rows with no value last. */
const sortByReward =
  (getValue: (row: PoolListItem) => number | undefined) => (x: Row<PoolListItem>, y: Row<PoolListItem>) =>
    (getValue(x.original) ?? -Infinity) - (getValue(y.original) ?? -Infinity)

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
  columnHelper.accessor((row) => (row.volume ? +row.volume : null), {
    id: PoolColumnId.Volume,
    header: headers[PoolColumnId.Volume],
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor((row) => (row.tvl ? +row.tvl : null), {
    id: PoolColumnId.Tvl,
    header: headers[PoolColumnId.Tvl],
    cell: UsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  hidden(PoolColumnId.UserHasPositions, { id: PoolColumnId.UserHasPositions, filterFn: boolFilterFn }),
  hidden((p) => p.tags, { id: PoolColumnId.PoolTags, filterFn: inListFilterFn }),
  hidden((row) => row.rewards, {
    id: PoolColumnId.RewardsCrv,
    header: headers[PoolColumnId.RewardsCrv],
    cell: RewardsCrvCell,
    filterFn: multiFilterFn,
    sortingFn: sortByReward((row) => row.rewards?.crv[0]),
  }),
  hidden((row) => row.rewards, {
    id: PoolColumnId.RewardsIncentives,
    header: headers[PoolColumnId.RewardsIncentives],
    cell: RewardsIncentivesCell,
    filterFn: multiFilterFn,
    sortingFn: sortByReward((row) => row.rewards && sumBy(row.rewards.other, (r) => r.apy)),
  }),
] satisfies PoolColumn[]
