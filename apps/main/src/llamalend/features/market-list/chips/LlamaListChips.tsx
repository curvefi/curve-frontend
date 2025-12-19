import { type ReactNode } from 'react'
import { LlamaMarket, LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenMarketsResetFilters } from '@ui-kit/shared/ui/DataTable/HiddenMarketsResetFilters'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../columns'
import { MarketListFilterDrawer } from '../drawers/MarketListFilterDrawer'
import { MarketSortDrawer } from '../drawers/MarketSortDrawer'
import { LlamaListMarketChips } from './LlamaListMarketChips'
import { LlamaListUserChips } from './LlamaListUserChips'

const { Spacing } = SizesAndSpaces

type LlamaListChipsProps = {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  children?: ReactNode
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  hasFavorites?: boolean
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
  data: LlamaMarket[]
  minLiquidity?: number
  userPositionsTab?: MarketRateType
} & FilterProps<LlamaMarketColumnId>

export const LlamaListChips = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  userHasPositions,
  hasFavorites,
  onSortingChange,
  sortField,
  data,
  minLiquidity = 0,
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
              <MarketSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
            )}
          </Grid>
          <Grid size={6}>
            <MarketListFilterDrawer
              userHasPositions={userHasPositions}
              hasFavorites={hasFavorites}
              data={data}
              minLiquidity={minLiquidity}
              hiddenMarketCount={hiddenMarketCount}
              resetFilters={resetFilters}
              hasFilters={hasFilters}
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
              <LlamaListUserChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
            </Grid>
          )}
        </>
      )}
      {hiddenMarketCount != null && !isMobile && (
        <HiddenMarketsResetFilters
          hiddenMarketCount={hiddenMarketCount}
          resetFilters={resetFilters}
          hasFilters={hasFilters}
        />
      )}
    </Grid>
  )
}
