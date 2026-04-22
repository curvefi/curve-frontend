import { type ReactNode } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { HeartIcon } from '@ui-kit/shared/icons/HeartIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../columns'
import { MarketListFilterDrawer } from '../drawers/MarketListFilterDrawer'
import { MarketSortDrawer } from '../drawers/MarketSortDrawer'
import { useToggleFilter } from '../hooks/useToggleFilter'

const { Spacing } = SizesAndSpaces

type LlamaListChipsProps = {
  hiddenCount: number
  resetFilters: () => void
  children?: ReactNode
  hasFavorites?: boolean
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
  data: LlamaMarket[]
  userPositionsTab?: MarketRateType
} & FilterProps<LlamaMarketColumnId>

export const NewLlamaListChips = ({
  hiddenCount,
  resetFilters,
  hasFavorites,
  onSortingChange,
  sortField,
  data,
  userPositionsTab,
  ...filterProps
}: LlamaListChipsProps) => {
  const isMobile = useIsMobile()
  const hasPopularFilters = userPositionsTab === MarketRateType.Borrow || !userPositionsTab
  const [favorites, toggleFavorites] = useToggleFilter(LlamaMarketColumnId.IsFavorite, filterProps)
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            {onSortingChange && sortField && (
              <MarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
            )}
          </Grid>
          <Grid size={6}>
            <MarketListFilterDrawer
              hasFavorites={hasFavorites}
              data={data}
              hiddenCount={hiddenCount}
              resetFilters={resetFilters}
              userPositionsTab={userPositionsTab}
              {...filterProps}
            />
          </Grid>
        </Grid>
      ) : (
        <GridChip
          label={t`Favorites`}
          selected={favorites}
          toggle={toggleFavorites}
          onDelete={toggleFavorites}
          icon={<HeartIcon />}
          data-testid="chip-favorites"
          disabled={hasPopularFilters}
        />
      )}
    </Grid>
  )
}
