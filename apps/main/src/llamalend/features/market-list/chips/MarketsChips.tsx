import { GridChip } from '@evm-ui/shared/ui/DataTable/chips/GridChip'
import Grid from '@mui/material/Grid'
import type { FilterProps } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { HeartIcon } from '@ui/icons/HeartIcon'
import { t } from '@ui/lib/i18n'
import { MarketColumnId } from '../columns'
import { useToggleFilter } from '../hooks/useToggleFilter'

const { Spacing } = SizesAndSpaces

type MarketsTableChipsProps = { hasFavorites: boolean | undefined } & FilterProps<MarketColumnId>

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
