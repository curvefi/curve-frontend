import { useMemo } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import type { MigrationOptions } from '@evm-ui/hooks/useStoredState'
import { useVisibilitySettings } from '@evm-ui/shared/ui/DataTable/hooks/useVisibilitySettings'
import type { VisibilityGroup } from '@evm-ui/shared/ui/DataTable/visibility.types'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { PoolColumnId, usePoolColumns, usePoolsColumnOptions, type PoolColumnVariant } from '../columns'
import type { PoolsSorting } from './usePoolsSorting'

const migration: MigrationOptions<Record<PoolColumnVariant, VisibilityGroup<PoolColumnId>[]>> = {
  version: 4,
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
  const columns = usePoolColumns()
  const columnOptions = usePoolsColumnOptions()
  const variant: PoolColumnVariant = isLite ? 'lite' : 'full'
  const [{ id: sortField }] = sorting
  const visibilitySettings = useVisibilitySettings(title, columnOptions, variant, columns, migration)
  const columnVisibility = useMemo(() => createMobileColumns(sortField), [sortField])

  return { columns, variant, sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
