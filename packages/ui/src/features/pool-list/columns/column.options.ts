import { recordEntries } from '@primitives/objects.utils'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { t } from '@ui/lib/i18n'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

const USER_POSITION_DISABLED_COLUMNS = [PoolColumnId.Volume, PoolColumnId.Tvl, PoolColumnId.Age]

const createVisibility = ({
  active,
  disabled,
  alwaysVisible,
}: {
  active: PoolColumnId[]
  disabled: PoolColumnId[]
  alwaysVisible: PoolColumnId[]
}): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: recordEntries(POOL_TITLES)
      .filter(([column]) => !alwaysVisible.includes(column))
      .map(([column, label]) => ({
        label,
        columns: [column],
        active: active.includes(column),
        enabled: !disabled.includes(column),
      })),
  },
]

export const POOLS_COLUMN_OPTIONS = {
  full: createVisibility({
    active: [PoolColumnId.NetRate, PoolColumnId.Volume, PoolColumnId.Tvl],
    disabled: [PoolColumnId.Deposits, PoolColumnId.Claimables],
    alwaysVisible: [PoolColumnId.PoolName],
  }),
  lite: createVisibility({
    active: [PoolColumnId.NetRate, PoolColumnId.Tvl],
    disabled: [
      PoolColumnId.BaseRate,
      PoolColumnId.WeeklyBaseRate,
      PoolColumnId.Volume,
      PoolColumnId.Age,
      PoolColumnId.Deposits,
      PoolColumnId.Claimables,
    ],
    alwaysVisible: [PoolColumnId.PoolName],
  }),
  userPositions: createVisibility({
    active: [PoolColumnId.NetRate, PoolColumnId.Claimables],
    disabled: USER_POSITION_DISABLED_COLUMNS,
    alwaysVisible: [PoolColumnId.PoolName, PoolColumnId.Deposits],
  }),
  residualClaims: createVisibility({
    active: [],
    disabled: [...USER_POSITION_DISABLED_COLUMNS, PoolColumnId.Deposits],
    alwaysVisible: [PoolColumnId.PoolName, PoolColumnId.Claimables],
  }),
}
