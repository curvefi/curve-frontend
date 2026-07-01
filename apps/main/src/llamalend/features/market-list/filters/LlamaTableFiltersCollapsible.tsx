import IconButton from '@mui/material/IconButton'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import type { FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { TableActiveFiltersBar } from '@ui-kit/shared/ui/DataTable/TableActiveFiltersBar'
import { LlamaMarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'
import { LlamaTableActiveFiltersChip } from './LlamaTableActiveFiltersChip'

const TEST_ID = 'table-filters-collapsible'

export const LlamaTableFiltersCollapsible = <T extends TableItem>({
  table,
  resetFilters,
  hasActiveFilters,
  hasFavorites,
  columnFiltersById,
  setColumnFilter,
}: {
  table: TanstackTable<T>
  resetFilters: () => void
  hasActiveFilters: boolean
  hasFavorites: boolean | undefined
} & FilterProps<LlamaMarketColumnId>) => {
  const isMobile = useIsMobile()
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, {
    columnFiltersById,
    setColumnFilter,
  })

  const favoriteChip = isMobile && (
    <IconButton size="small" onClick={toggleFavorites} disabled={!hasFavorites} data-testid={`chip-favorites`}>
      <FavoriteHeartIcon isFavorite={favorites} />
    </IconButton>
  )

  return (
    <TableActiveFiltersBar
      hasActiveFilters={hasActiveFilters}
      resetFilters={resetFilters}
      testId={TEST_ID}
      endSlot={favoriteChip}
    >
      {!isMobile && (
        <LlamaTableActiveFiltersChip table={table} setColumnFilter={setColumnFilter} testIdPrefix={TEST_ID} />
      )}
    </TableActiveFiltersBar>
  )
}
