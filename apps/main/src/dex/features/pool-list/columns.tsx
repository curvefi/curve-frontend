import { createColumnHelper, FilterFnOption } from '@tanstack/react-table'
import type { ColumnDef, DeepKeys } from '@tanstack/table-core'
import { t } from '@ui-kit/lib/i18n'
import { boolFilterFn, filterByText, inListFilterFn } from '@ui-kit/shared/ui/DataTable/filters'
import { PoolTitleCell } from './cells/PoolTitleCell/PoolTitleCell'
import { PoolTvlCell } from './cells/PoolTvlCell'
import { PoolVolumeCell } from './cells/PoolVolumeCell'
import { RewardsBaseCell } from './cells/RewardsBaseCell'
import { RewardsCrvCell } from './cells/RewardsCrvCell'
import { RewardsHeader } from './cells/RewardsHeader'
import { RewardsOtherCell } from './cells/RewardsOtherCell'
import type { PoolListItem } from './types'

export enum PoolColumnId {
  UserHasPositions = 'hasPosition',
  PoolName = 'PoolName',
  RewardsBase = 'RewardsBase',
  RewardsCrv = 'RewardsCrv',
  RewardsOther = 'RewardsOther',
  Volume = 'volume',
  Tvl = 'tvl',
  PoolTags = 'tags',
}

const columnHelper = createColumnHelper<PoolListItem>()

const headers = {
  [PoolColumnId.PoolName]: t`Pool`,
  [PoolColumnId.RewardsBase]: RewardsHeader,
  [PoolColumnId.RewardsCrv]: t`CRV`,
  [PoolColumnId.RewardsOther]: t`Incentives`,
  [PoolColumnId.Volume]: t`Volume`,
  [PoolColumnId.Tvl]: t`TVL`,
}

type PoolColumn = ColumnDef<PoolListItem, any>

/** Define a hidden column. */
const hidden = (field: DeepKeys<PoolListItem>, id: PoolColumnId, filterFn: FilterFnOption<PoolListItem>) =>
  columnHelper.accessor(field, { id, filterFn, meta: { hidden: true } })

export const POOL_LIST_COLUMNS = [
  columnHelper.accessor('pool.name', {
    id: PoolColumnId.PoolName,
    header: t`Pool`,
    cell: PoolTitleCell,
    filterFn: filterByText(
      'pool.wrappedCoins',
      'pool.wrappedCoinAddresses',
      'pool.underlyingCoins',
      'pool.underlyingCoinAddresses',
      'pool.name',
      'pool.address',
      'pool.gauge.address',
      'pool.lpToken',
    ),
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
  columnHelper.accessor((row) => row.rewards?.crv, {
    id: PoolColumnId.RewardsCrv,
    header: headers[PoolColumnId.RewardsCrv],
    meta: { type: 'numeric' },
    cell: RewardsCrvCell,
  }),
  columnHelper.accessor((row) => row.rewards?.other, {
    id: PoolColumnId.RewardsOther,
    header: headers[PoolColumnId.RewardsOther],
    cell: RewardsOtherCell,
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
] satisfies PoolColumn[]
