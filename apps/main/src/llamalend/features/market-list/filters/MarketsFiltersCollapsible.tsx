import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { FavoriteHeartIcon } from '@evm-ui/shared/icons/HeartIcon'
import type { CurveTableFeatures, FilterProps } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TableActiveFiltersBar } from '@evm-ui/shared/ui/DataTable/TableActiveFiltersBar'
import IconButton from '@mui/material/IconButton'
import type { ReactTable } from '@tanstack/react-table'
import { MarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'
import { MarketsActiveFiltersChip } from './MarketsActiveFiltersChip'

const TEST_ID = 'table-filters-collapsible'

export const MarketsFiltersCollapsible = ({
  table,
  resetFilters,
  hasActiveFilters,
  hasFavorites,
  columnFiltersById,
  setColumnFilter,
}: {
  table: ReactTable<CurveTableFeatures, LlamaMarketRow>
  resetFilters: () => void
  hasActiveFilters: boolean
  hasFavorites: boolean | undefined
} & FilterProps<MarketColumnId>) => {
  const isMobile = useIsMobile()
  const [favorites, toggleFavorites] = useToggleFilter(MarketColumnId.IsFavorite, {
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
      {!isMobile && <MarketsActiveFiltersChip table={table} setColumnFilter={setColumnFilter} testIdPrefix={TEST_ID} />}
    </TableActiveFiltersBar>
  )
}
