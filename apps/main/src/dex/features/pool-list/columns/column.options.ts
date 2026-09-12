import { recordEntries } from '@primitives/objects.utils'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { t } from '@ui/lib/i18n'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

const DEFAULT_ACTIVE = [PoolColumnId.PoolName, PoolColumnId.NetRate] as const

const createVisibility = (active: PoolColumnId[], disabled: PoolColumnId[]): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: recordEntries(POOL_TITLES).map(([column, label]) => ({
      label,
      columns: [column],
      active: [...DEFAULT_ACTIVE, ...active].includes(column),
      enabled: !disabled.includes(column),
    })),
  },
]

export const POOLS_COLUMN_OPTIONS = {
  full: createVisibility([PoolColumnId.Volume, PoolColumnId.Tvl], [PoolColumnId.Deposits]),
  lite: createVisibility(
    [PoolColumnId.Tvl],
    [PoolColumnId.BaseRate, PoolColumnId.WeeklyBaseRate, PoolColumnId.Volume, PoolColumnId.Age, PoolColumnId.Deposits],
  ),
  userPositions: createVisibility([PoolColumnId.Deposits], [PoolColumnId.Volume, PoolColumnId.Tvl, PoolColumnId.Age]),
}

export const getDefaultPoolsSort = (isLite: boolean) => [
  { id: isLite ? PoolColumnId.Tvl : PoolColumnId.Volume, desc: true },
]
