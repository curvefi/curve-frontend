import { type ReactNode } from 'react'
import { LlamaMarket, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenMarketsResetFilters } from '@ui-kit/shared/ui/DataTable/HiddenMarketsResetFilters'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns.enum'
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
  userHasPositions?: LlamaMarketsResult['userHasPositions']
  hasFavorites?: boolean
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
  data: LlamaMarket[]
  minLiquidity?: number
  isUserPositions?: boolean
} & FilterProps<string>

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
  isUserPositions,
  ...filterProps
}: LlamaListChipsProps) => {
  const isMobile = useIsMobile()
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
              isUserPositions
              {...filterProps}
            />
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <LlamaListMarketChips {...filterProps} />
          </Grid>
          {!isUserPositions && (
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
