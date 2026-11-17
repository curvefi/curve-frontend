import type { ColumnFiltersState } from '@tanstack/react-table'
import { MarketColumnId } from '../columns/columns.enum'

/** Filters shown in the active-filters row. Favorites is left out: the Favorites chip is always visible. */
export const getActiveFilterChips = (columnFilters: ColumnFiltersState) =>
  (columnFilters as { id: MarketColumnId; value: string }[]).filter(({ id }) => id !== MarketColumnId.IsFavorite)
