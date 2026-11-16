import Grid from '@mui/material/Grid'
import { GridChip } from '@ui/features/tables/chips/GridChip'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { FavoriteHeartIcon } from '@ui/icons/HeartIcon'
import { t } from '@ui/lib/i18n'
import { MarketColumnId } from '../columns/columns.enum'
import { useToggleFilter } from '../hooks/useToggleFilter'

const { Spacing } = SizesAndSpaces

type MarketsTableChipsProps = { favoritesCount: number } & FilterProps<MarketColumnId>

export const MarketsChips = ({ favoritesCount, ...filterProps }: MarketsTableChipsProps) => {
  const [favorites, toggleFavorites] = useToggleFilter(MarketColumnId.IsFavorite, filterProps)
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      <GridChip
        label={favorites ? t`Favorites (${favoritesCount})` : t`Favorites`}
        selected={favorites}
        selectableChipSize="medium"
        variant="ghost"
        toggle={toggleFavorites}
        icon={<FavoriteHeartIcon isFavorite={favorites} />}
        data-testid="chip-favorites"
        disabled={!favoritesCount}
      />
    </Grid>
  )
}
