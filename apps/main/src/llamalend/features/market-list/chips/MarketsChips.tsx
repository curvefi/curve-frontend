import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'

const { Spacing } = SizesAndSpaces

type MarketsTableChipsProps = {
  hasFavorites: boolean | undefined
} & FilterProps<MarketColumnId>

export const MarketsChips = ({ hasFavorites, ...filterProps }: MarketsTableChipsProps) => {
  const [favorites, toggleFavorites] = useToggleFilter(MarketColumnId.IsFavorite, filterProps)
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      <GridChip
        label={t`Favorites`}
        selected={favorites}
        selectableChipSize="medium"
        variant="ghost"
        toggle={toggleFavorites}
        icon={<HeartIcon />}
        data-testid="chip-favorites"
        disabled={!hasFavorites}
      />
    </Grid>
  )
}
