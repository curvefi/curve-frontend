import { useMemo } from 'react'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import { POOL_COLUMNS, POOLS_COLUMN_OPTIONS, PoolColumnId } from '../columns'
import type { PoolsSorting } from './usePoolsSorting'

type PoolColumnVariant = keyof typeof POOLS_COLUMN_OPTIONS

const migration: MigrationOptions<Record<PoolColumnVariant, VisibilityGroup<PoolColumnId>[]>> = {
  version: 2,
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

  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
