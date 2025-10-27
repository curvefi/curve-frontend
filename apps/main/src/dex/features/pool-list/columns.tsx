import { sum } from 'lodash'
import { Pool } from '@/dex/types/main.types'
import { createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import type { ColumnDef, DeepKeys } from '@tanstack/table-core'
import { AccessorFn } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { boolFilterFn, filterByText, inListFilterFn, multiFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { PoolTitleCell } from './cells/PoolTitleCell/PoolTitleCell'
import { PoolTvlCell } from './cells/PoolTvlCell'
import { PoolVolumeCell } from './cells/PoolVolumeCell'
import { RewardsBaseCell } from './cells/RewardsBaseCell'
import { RewardsBaseHeader } from './cells/RewardsBaseHeader'
import { RewardsOtherCell } from './cells/RewardsOtherCell'
import { RewardsOtherHeader } from './cells/RewardsOtherHeader'
import type { PoolListItem } from './types'

export enum PoolColumnId {
  UserHasPositions = 'hasPosition',
  PoolName = 'PoolName',
  RewardsBase = 'RewardsBase',
  RewardsCrv = 'RewardsCrv',
  RewardsIncentives = 'RewardsIncentives',
  RewardsOther = 'RewardsOther', // == RewardsCrv + RewardsIncentives
  Volume = 'volume',
  Tvl = 'tvl',
  PoolTags = 'tags',
}

const columnHelper = createColumnHelper<PoolListItem>()

const headers = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.RewardsBase]: RewardsBaseHeader,
  [PoolColumnId.RewardsOther]: RewardsOtherHeader,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

type PoolColumn = ColumnDef<PoolListItem, any>

/** Define a hidden column. */
const hidden = (
  id: PoolColumnId,
  accessor: DeepKeys<PoolListItem> | AccessorFn<PoolListItem>,
  filterFn: FilterFnOption<PoolListItem>,
) => columnHelper.accessor(accessor, { id, filterFn, meta: { hidden: true }, sortUndefined: 'last' })

export const POOL_TEXT_FIELDS = [
  'pool.wrappedCoins',
  'pool.wrappedCoinAddresses',
  'pool.underlyingCoins',
  'pool.underlyingCoinAddresses',
  'pool.name',
  'pool.address',
  'pool.gauge.address',
  'pool.lpToken',
] satisfies DeepKeys<{ pool: Pool }>[]

export const POOL_LIST_COLUMNS = [
  columnHelper.accessor('pool.name', {
    id: PoolColumnId.PoolName,
    header: t`Pool`,
    cell: PoolTitleCell,
    filterFn: filterByText(...POOL_TEXT_FIELDS),
  }),
  columnHelper.accessor((row) => row.rewards?.base, {
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
    cell: PoolVolumeCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  columnHelper.accessor((row) => (row.tvl ? +row.tvl.value : null), {
    id: PoolColumnId.Tvl,
    header: headers[PoolColumnId.Tvl],
    cell: PoolTvlCell,
    meta: { type: 'numeric' },
    sortUndefined: 'last',
  }),
  hidden(PoolColumnId.UserHasPositions, PoolColumnId.UserHasPositions, boolFilterFn),
  hidden(PoolColumnId.PoolTags, PoolColumnId.PoolTags, inListFilterFn),
  hidden(PoolColumnId.RewardsCrv, (row) => row.rewards?.crv, multiFilterFn),
  hidden(PoolColumnId.RewardsIncentives, (row) => (row.rewards ? sum(row.rewards.other) : undefined), multiFilterFn),
] satisfies PoolColumn[]
