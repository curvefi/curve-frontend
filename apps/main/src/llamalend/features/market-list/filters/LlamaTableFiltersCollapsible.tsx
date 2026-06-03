import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { FavoriteHeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import type { FilterProps, TableItem, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'
import { LlamaTableActiveFiltersChip } from './LlamaTableActiveFiltersChip'

const { Spacing } = SizesAndSpaces

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

  return (
    <Stack
      direction="row"
      sx={{
        paddingBlock: Spacing.xs,
        paddingInline: Spacing.sm,
        alignItems: 'end',
        gap: Spacing.sm,
        justifyContent: 'space-between',
        borderTop: borderStyle,
      }}
      data-testid={TEST_ID}
    >
      {!isMobile && (
        <LlamaTableActiveFiltersChip table={table} setColumnFilter={setColumnFilter} testIdPrefix={TEST_ID} />
      )}

      <Button
        color="ghost"
        size="extraSmall"
        onClick={resetFilters}
        disabled={!hasActiveFilters}
        sx={{ flexShrink: 0 }}
        data-testid={`${TEST_ID}-reset-btn`}
      >
        {t`Reset filters`}
      </Button>

      {isMobile && (
        <IconButton size="small" onClick={toggleFavorites} disabled={!hasFavorites} data-testid={`chip-favorites`}>
          <FavoriteHeartIcon isFavorite={favorites} />
        </IconButton>
      )}
    </Stack>
  )
}
