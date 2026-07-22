import { useMemo } from 'react'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { POOL_COLUMNS, POOLS_COLUMN_OPTIONS, PoolColumnId } from '../columns'
import type { PoolsSorting } from './usePoolsSorting'

export type PoolColumnVariant = keyof typeof POOLS_COLUMN_OPTIONS

const MIGRATION_COLUMN_IDS: Record<PoolColumnId, readonly string[]> = {
  [PoolColumnId.PoolName]: [PoolColumnId.PoolName],
  [PoolColumnId.NetApy]: [PoolColumnId.NetApy, 'RewardsOther'],
  [PoolColumnId.BaseApy]: [PoolColumnId.BaseApy, 'RewardsBase'],
  [PoolColumnId.RewardsApy]: [PoolColumnId.RewardsApy, 'IncentivesApy', 'RewardsOther'],
  [PoolColumnId.GaugeApy]: [PoolColumnId.GaugeApy, 'RewardsOther'],
  [PoolColumnId.Points]: [PoolColumnId.Points, 'RewardsOther'],
  [PoolColumnId.Volume]: [PoolColumnId.Volume],
  [PoolColumnId.Tvl]: [PoolColumnId.Tvl],
}

const isUnknownRecord = (value: unknown): value is Record<string, unknown> => typeof value == 'object' && value != null
const isUnknownArray = (value: unknown): value is unknown[] => Array.isArray(value)

const getStoredActive = (groups: unknown, columnIds: readonly string[]): boolean | undefined => {
  if (!isUnknownArray(groups)) return undefined

  for (const group of groups) {
    if (!isUnknownRecord(group) || !isUnknownArray(group.options)) continue

    for (const option of group.options) {
      if (!isUnknownRecord(option) || !isUnknownArray(option.columns) || typeof option.active != 'boolean') continue

      if (option.columns.some(column => typeof column == 'string' && columnIds.includes(column))) {
        return option.active
      }
    }
  }

  return undefined
}

const migrateVisibilityGroups = (
  oldGroups: unknown,
  initialGroups: VisibilityGroup<PoolColumnId>[],
): VisibilityGroup<PoolColumnId>[] =>
  initialGroups.map(group => ({
    ...group,
    options: group.options.map(option => {
      const columnIds = option.columns.flatMap(column => MIGRATION_COLUMN_IDS[column])
      const storedActive = getStoredActive(oldGroups, columnIds)

      return {
        ...option,
        active: option.enabled && (storedActive ?? option.active),
      }
    }),
  }))

const getStoredVariant = (value: unknown, variant: PoolColumnVariant): unknown =>
  isUnknownRecord(value) ? value[variant] : undefined

const migration: MigrationOptions<Record<PoolColumnVariant, VisibilityGroup<PoolColumnId>[]>> = {
  version: 3,
  migrate: (oldValue, initialValue) => ({
    full: migrateVisibilityGroups(getStoredVariant(oldValue, 'full'), initialValue.full),
    lite: migrateVisibilityGroups(getStoredVariant(oldValue, 'lite'), initialValue.lite),
  }),
}

/**
 * Create a map of column visibility for the pool list on mobile devices.
 * On mobile that is just the title and the column that is currently sorted.
 */
const createMobileColumns = (sortBy: PoolColumnId) =>
  fromEntries(recordValues(PoolColumnId).map(key => [key, key === PoolColumnId.PoolName || key === sortBy]))

export function usePoolsVisibility(
  title: string,
  {
    isLite,
    sorting,
  }: {
    isLite: boolean
    sorting: PoolsSorting
  },
) {
  const variant: PoolColumnVariant = isLite ? 'lite' : 'full'
  const [{ id: sortField }] = sorting
  const visibilitySettings = useVisibilitySettings(title, POOLS_COLUMN_OPTIONS, variant, POOL_COLUMNS, migration)
  const columnVisibility = useMemo(() => createMobileColumns(sortField), [sortField])

  return { variant, sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
