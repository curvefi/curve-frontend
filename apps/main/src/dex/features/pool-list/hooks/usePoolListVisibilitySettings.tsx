import { useMemo } from 'react'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import type { SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui-kit/shared/ui/DataTable/visibility.types'
import {
  POOL_LIST_COLUMNS,
  POOL_LIST_COLUMN_OPTIONS,
  PoolListColumnId,
  PoolListColumnVariant,
  getDefaultSort,
} from '../columns'

const migration: MigrationOptions<Record<PoolListColumnVariant, VisibilityGroup<PoolListColumnId>[]>> = {
  version: 1,
}

/**
 * Create a map of column visibility for the pool list on mobile devices.
 * On mobile that is just the title and the column that is currently sorted.
 */
const createMobileColumns = (sortBy: PoolListColumnId) =>
  fromEntries(recordValues(PoolListColumnId).map(key => [key, key === PoolListColumnId.PoolName || key === sortBy]))

export function usePoolListVisibilitySettings(
  title: string,
  {
    isLite,
    sorting,
  }: {
    isLite: boolean
    sorting: SortingState
  },
) {
  const variant: PoolListColumnVariant = isLite ? 'lite' : 'full'
  const sortField = (sorting.length ? sorting : getDefaultSort(isLite))[0].id as PoolListColumnId
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
