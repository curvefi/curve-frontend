import { recordEntries } from '@primitives/objects.utils'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { t } from '@ui/lib/i18n'
import { POOL_TITLES } from './column.titles'
import { PoolColumnId } from './columns.enum'

type ColumnVisibility = Record<PoolColumnId, { active: boolean; enabled: boolean }>

const FULL_COLUMN_VISIBILITY = {
  [PoolColumnId.PoolName]: { active: true, enabled: true },
  [PoolColumnId.Tokens]: { active: false, enabled: true },
  [PoolColumnId.NetRate]: { active: true, enabled: true },
  [PoolColumnId.BaseRate]: { active: false, enabled: true },
  [PoolColumnId.WeeklyBaseRate]: { active: false, enabled: true },
  [PoolColumnId.CrvRate]: { active: false, enabled: true },
  [PoolColumnId.RewardsRate]: { active: false, enabled: true },
  [PoolColumnId.Points]: { active: false, enabled: true },
  [PoolColumnId.Volume]: { active: true, enabled: true },
  [PoolColumnId.Tvl]: { active: true, enabled: true },
  [PoolColumnId.Age]: { active: false, enabled: true },
  [PoolColumnId.Deposits]: { active: false, enabled: false },
} satisfies ColumnVisibility

const LITE_COLUMN_VISIBILITY = {
  [PoolColumnId.PoolName]: { active: true, enabled: true },
  [PoolColumnId.Tokens]: { active: false, enabled: true },
  [PoolColumnId.NetRate]: { active: true, enabled: true },
  [PoolColumnId.BaseRate]: { active: false, enabled: false },
  [PoolColumnId.WeeklyBaseRate]: { active: false, enabled: false },
  [PoolColumnId.CrvRate]: { active: false, enabled: true },
  [PoolColumnId.RewardsRate]: { active: false, enabled: true },
  [PoolColumnId.Points]: { active: false, enabled: true },
  [PoolColumnId.Volume]: { active: false, enabled: false },
  [PoolColumnId.Tvl]: { active: true, enabled: true },
  [PoolColumnId.Age]: { active: false, enabled: false },
  [PoolColumnId.Deposits]: { active: false, enabled: false },
} satisfies ColumnVisibility

const USER_POSITIONS_COLUMN_VISIBILITY = {
  [PoolColumnId.PoolName]: { active: true, enabled: true },
  [PoolColumnId.Tokens]: { active: false, enabled: false },
  [PoolColumnId.NetRate]: { active: true, enabled: true },
  [PoolColumnId.BaseRate]: { active: false, enabled: true },
  [PoolColumnId.WeeklyBaseRate]: { active: false, enabled: true },
  [PoolColumnId.CrvRate]: { active: false, enabled: true },
  [PoolColumnId.RewardsRate]: { active: false, enabled: true },
  [PoolColumnId.Points]: { active: false, enabled: true },
  [PoolColumnId.Volume]: { active: false, enabled: false },
  [PoolColumnId.Tvl]: { active: false, enabled: false },
  [PoolColumnId.Age]: { active: false, enabled: false },
  [PoolColumnId.Deposits]: { active: true, enabled: true },
} satisfies ColumnVisibility

const createVisibility = (visibility: ColumnVisibility): VisibilityGroup<PoolColumnId>[] => [
  {
    label: t`Pools`,
    options: recordEntries(visibility).map(([column, settings]) => ({
      label: POOL_TITLES[column],
      columns: [column],
      ...settings,
    })),
  },
]

export const POOLS_COLUMN_OPTIONS = {
  full: createVisibility(FULL_COLUMN_VISIBILITY),
  lite: createVisibility(LITE_COLUMN_VISIBILITY),
  userPositions: createVisibility(USER_POSITIONS_COLUMN_VISIBILITY),
}

export const getDefaultPoolsSort = (isLite: boolean) => [
  { id: isLite ? PoolColumnId.Tvl : PoolColumnId.Volume, desc: true },
]
