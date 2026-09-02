import { useMemo } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import type { MigrationOptions } from '@evm-ui/hooks/useStoredState'
import {
  preserveVisibilityChoices,
  useVisibilitySettings,
} from '@evm-ui/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { fromEntries, mapRecord, recordValues } from '@primitives/objects.utils'
import { POOL_COLUMNS, POOLS_COLUMN_OPTIONS, PoolColumnId } from '../columns'
import type { PoolsSorting } from './usePoolsSorting'

export type PoolColumnVariant = keyof typeof POOLS_COLUMN_OPTIONS

const migration: MigrationOptions<Record<PoolColumnVariant, VisibilityGroup<PoolColumnId>[]>> = {
  version: 3,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, currentGroups) => preserveVisibilityChoices(oldValue[variant], currentGroups)),
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
