import { sumBy } from 'lodash'
import { createColumnHelper } from '@tanstack/react-table'
import type { Row } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import type { ColumnDefinition } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { boolFilterFn, inListFilterFn, multiFilterFn, rangeFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { LegacyRewardsBaseCell } from '../cells/LegacyRewardsBaseCell'
import { LegacyRewardsBaseHeader } from '../cells/LegacyRewardsBaseHeader'
import { LegacyRewardsCrvCell } from '../cells/LegacyRewardsCrvCell'
import { LegacyRewardsIncentivesCell } from '../cells/LegacyRewardsIncentivesCell'
import { LegacyRewardsOtherCell } from '../cells/LegacyRewardsOtherCell'
import { LegacyRewardsOtherHeader } from '../cells/LegacyRewardsOtherHeader'
import { LegacyUsdCell } from '../cells/LegacyUsdCell'
import { LegacyPoolTitleCell } from '../cells/PoolTitleCell/LegacyPoolTitleCell'
import type { LegacyPoolListItem } from '../legacyPoolList.types'
import { LegacyPoolColumnId } from './legacy-column.enum'

const columnHelper = createColumnHelper<LegacyPoolListItem>()

const headers = {
  [LegacyPoolColumnId.PoolName]: t`Pool`,
  [LegacyPoolColumnId.RewardsBase]: LegacyRewardsBaseHeader,
  [LegacyPoolColumnId.RewardsCrv]: t`CRV APR`,
  [LegacyPoolColumnId.RewardsIncentives]: t`Incentives APR`,
  [LegacyPoolColumnId.RewardsOther]: LegacyRewardsOtherHeader,
  [LegacyPoolColumnId.Volume]: t`Volume`,
  [LegacyPoolColumnId.Tvl]: t`TVL`,
}

type LegacyPoolColumn = ColumnDefinition<LegacyPoolListItem>

/** Sorts pool rows by a numeric reward value, placing rows with no value last. */
const sortByReward =
  (getValue: (row: LegacyPoolListItem) => number | undefined) => (x: Row<LegacyPoolListItem>, y: Row<LegacyPoolListItem>) =>
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

export const LEGACY_POOL_LIST_COLUMNS = [
  columnHelper.accessor('pool.name', {
    id: LegacyPoolColumnId.PoolName,
    header: t`Pool`,
    cell: LegacyPoolTitleCell,
  }),
  columnHelper.accessor(row => (row.rewards?.base ? +row.rewards.base.day : null), {
    id: LegacyPoolColumnId.RewardsBase,
    header: headers[LegacyPoolColumnId.RewardsBase],
    cell: LegacyRewardsBaseCell,
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
    id: LegacyPoolColumnId.RewardsOther,
    header: headers[LegacyPoolColumnId.RewardsOther],
    cell: LegacyRewardsOtherCell,
    enableSorting: false, // that's done in the separate columns RewardsCrv and RewardsIncentives
    enableMultiSort: false, // that's done in the separate columns RewardsCrv and RewardsIncentives
    meta: { type: 'numeric', tooltip: { title: t`Token APR based on current prices of tokens and reward rates` } },
  }),
  columnHelper.accessor(row => (row.volume ? +row.volume : null), {
    id: LegacyPoolColumnId.Volume,
    header: headers[LegacyPoolColumnId.Volume],
    cell: LegacyUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  columnHelper.accessor(row => (row.tvl ? +row.tvl : null), {
    id: LegacyPoolColumnId.Tvl,
    header: headers[LegacyPoolColumnId.Tvl],
    cell: LegacyUsdCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
    filterFn: rangeFilterFn,
  }),
  hidden(LegacyPoolColumnId.UserHasPositions, { id: LegacyPoolColumnId.UserHasPositions, filterFn: boolFilterFn }),
  hidden(p => p.tags, { id: LegacyPoolColumnId.PoolTags, filterFn: inListFilterFn }),
  hidden(row => row.rewards, {
    id: LegacyPoolColumnId.RewardsCrv,
    header: headers[LegacyPoolColumnId.RewardsCrv],
    cell: LegacyRewardsCrvCell,
    filterFn: multiFilterFn,
    sortingFn: sortByReward(row => row.rewards?.crv[0]),
  }),
  hidden(row => row.rewards, {
    id: LegacyPoolColumnId.RewardsIncentives,
    header: headers[LegacyPoolColumnId.RewardsIncentives],
    cell: LegacyRewardsIncentivesCell,
    filterFn: multiFilterFn,
    sortingFn: sortByReward(row => row.rewards && sumBy(row.rewards.other, r => r.apy)),
  }),
] satisfies LegacyPoolColumn[]
