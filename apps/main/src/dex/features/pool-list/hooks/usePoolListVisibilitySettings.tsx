import { useMemo } from 'react'
import { fromEntries, recordValues } from '@curvefi/prices-api/objects.util'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { POOL_LIST_COLUMN_OPTIONS, PoolColumnVariant } from '../column-options'
import { POOL_LIST_COLUMNS, PoolColumnId } from '../columns'

export const DEFAULT_SORT = [{ id: PoolColumnId.Volume, desc: true }]
const migration: MigrationOptions<Record<PoolColumnVariant, VisibilityGroup<PoolColumnId>[]>> = { version: 1 }

/**
 * Create a map of column visibility for the pool list on mobile devices.
 * On mobile that is just the title and the column that is currently sorted.
 */
export const createMobileColumns = (sortBy: PoolColumnId) =>
  fromEntries(recordValues(PoolColumnId).map((key) => [key, key === PoolColumnId.PoolName || key === sortBy]))

export function usePoolListVisibilitySettings(
  title: string,
  {
    isLite,
    isCrvRewardsEnabled,
    sorting,
  }: {
    isLite: boolean
    isCrvRewardsEnabled: boolean
    sorting: SortingState
  },
) {
  const variant = `${isLite ? 'lite' : 'full'}${isCrvRewardsEnabled ? 'With' : 'No'}CrvReward` as PoolColumnVariant
  const sortField = (sorting.length ? sorting : DEFAULT_SORT)[0].id as PoolColumnId
  const visibilitySettings = useVisibilitySettings(
    title,
    POOL_LIST_COLUMN_OPTIONS,
    variant,
    POOL_LIST_COLUMNS,
    migration,
  )
  const columnVisibility = useMemo(() => createMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
