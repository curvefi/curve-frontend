import { useMemo } from 'react'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import {
  LEGACY_POOL_COLUMNS,
  LEGACY_POOLS_COLUMN_OPTIONS,
  LegacyPoolColumnId,
  getDefaultLegacyPoolsSort,
} from '../columns'

export type LegacyPoolColumnVariant = keyof typeof LEGACY_POOLS_COLUMN_OPTIONS

const migration: MigrationOptions<Record<LegacyPoolColumnVariant, VisibilityGroup<LegacyPoolColumnId>[]>> = {
  version: 1,
}

/**
 * Create a map of column visibility for the pool list on mobile devices.
 * On mobile that is just the title and the column that is currently sorted.
 */
const createMobileColumns = (sortBy: LegacyPoolColumnId) =>
  fromEntries(recordValues(LegacyPoolColumnId).map(key => [key, key === LegacyPoolColumnId.PoolName || key === sortBy]))

export function useLegacyPoolsVisibility(
  title: string,
  {
    isLite,
    sorting,
  }: {
    isLite: boolean
    sorting: SortingState
  },
) {
  const variant: LegacyPoolColumnVariant = isLite ? 'lite' : 'full'
  const sortField = (sorting.length ? sorting : getDefaultLegacyPoolsSort(isLite))[0].id as LegacyPoolColumnId
  const visibilitySettings = useVisibilitySettings(
    title,
    LEGACY_POOLS_COLUMN_OPTIONS,
    variant,
    LEGACY_POOL_COLUMNS,
    migration,
  )
  const columnVisibility = useMemo(() => createMobileColumns(sortField), [sortField])
  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
