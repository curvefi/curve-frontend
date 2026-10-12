import { useMemo } from 'react'
import { fromEntries, mapRecord, recordValues } from '@primitives/objects.utils'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import { preserveVisibilityChoices, useVisibilitySettings } from '@ui/features/tables/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { POOLS_COLUMN_OPTIONS } from '../columns/column.options'
import { PoolColumnId } from '../columns/columns.enum'
import type { PoolTableVariant } from '../types'

const migration: MigrationOptions<Record<PoolTableVariant, VisibilityGroup<PoolColumnId>[]>> = {
  version: 8,
  migrate: (oldValue, initialValue) =>
    mapRecord(initialValue, (variant, currentGroups) => preserveVisibilityChoices(oldValue[variant], currentGroups)),
}

/**
 * Create a map of column visibility for the pool list on mobile devices.
 * Show the title and the chosen metric, independently of how the table is sorted.
 */
const createMobileColumns = (mobileColumn: PoolColumnId) =>
  fromEntries(recordValues(PoolColumnId).map(key => [key, key === PoolColumnId.PoolName || key === mobileColumn]))

export function usePoolsVisibility(
  title: string,
  { variant, mobileColumn }: { variant: PoolTableVariant; mobileColumn: PoolColumnId },
) {
  const visibilitySettings = useVisibilitySettings(title, POOLS_COLUMN_OPTIONS, variant, migration)
  const columnVisibility = useMemo(() => createMobileColumns(mobileColumn), [mobileColumn])

  return { variant, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
