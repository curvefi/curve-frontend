import { type ReactNode } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../columns'
import { LegacyMarketListFilterDrawer } from '../drawers/LegacyMarketListFilterDrawer'
import { LegacyMarketSortDrawer } from '../drawers/LegacyMarketSortDrawer'
import { LlamaListMarketChips } from './LlamaListMarketChips'
import { LlamaListUserChips } from './LlamaListUserChips'

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

export const LegacyLlamaListChips = ({
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
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            {onSortingChange && sortField && (
              <LegacyMarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
            )}
          </Grid>
          <Grid size={6}>
            <LegacyMarketListFilterDrawer
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
        <>
          {hasPopularFilters && (
            <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
              <LlamaListMarketChips {...filterProps} />
            </Grid>
          )}
          {!userPositionsTab && (
            <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
              <LlamaListUserChips hasFavorites={hasFavorites} {...filterProps} />
            </Grid>
          )}
        </>
      )}
      {hiddenCount != null && !isMobile && (
        <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />
      )}
    </Grid>
  )
}
