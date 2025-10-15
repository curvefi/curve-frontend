import { type ReactNode } from 'react'
import { LlamaMarket, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns.enum'
import { MarketListFilterDrawer } from '../drawers/MarketListFilterDrawer'
import { MarketSortDrawer } from '../drawers/MarketSortDrawer'
import { HiddenMarketsResetFilters } from './HiddenMarketsResetFilters'
import { LlamaListFilterChips } from './LlamaListFilterChips'
import { MarketTypeFilterChips } from './MarketTypeFilterChips'

const { Spacing } = SizesAndSpaces

type MarketsFilterChipsProps = {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  children?: ReactNode
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  hasFavorites: boolean | undefined
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
  data: LlamaMarket[]
  minLiquidity: number
} & FilterProps<string>

export const MarketFilterChipWrapper = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  userHasPositions,
  hasFavorites,
  onSortingChange,
  sortField,
  data,
  minLiquidity,
  ...filterProps
}: MarketsFilterChipsProps) => {
  const isMobile = useIsMobile()
  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.md} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.xs} size={12}>
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
              {...filterProps}
            />
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <MarketTypeFilterChips {...filterProps} />
          </Grid>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <LlamaListFilterChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
          </Grid>
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
