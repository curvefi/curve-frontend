import { useMemo } from 'react'
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
  createPoolListMobileColumns,
  getDefaultSort,
} from '../columns'

const migration: MigrationOptions<Record<PoolListColumnVariant, VisibilityGroup<PoolListColumnId>[]>> = {
  version: 1,
}

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
  const columnVisibility = useMemo(() => createPoolListMobileColumns(sortField), [sortField])

  return { sortField, ...visibilitySettings, ...(useIsMobile() && { columnVisibility }) }
}
