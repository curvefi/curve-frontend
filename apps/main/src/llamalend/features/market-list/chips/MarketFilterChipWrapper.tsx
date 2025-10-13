import { type ReactNode } from 'react'
import { LlamaMarket, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns.enum'
import { MarketListFilterDrawer } from '../drawers/MarketListFilterDrawer'
import { MarketSortDrawer } from '../drawers/MarketSortDrawer'
import { ChipGridItem } from './ChipGridItem'
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
  onSortingChange?: OnChangeFn<SortingState>
  sortField?: LlamaMarketColumnId
  data: LlamaMarket[]
  minLiquidity?: number
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
  const tooltip =
    !hasFilters && hiddenMarketCount
      ? t`Some markets are hidden by default due to low liquidity. You may change that in the liquidity filter.`
      : null

  const isMobile = useIsMobile()
  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.md} size={{ mobile: 12, tablet: 'auto' }}>
      {!isMobile ? (
        <>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <MarketTypeFilterChips {...filterProps} />
          </Grid>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <LlamaListFilterChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
          </Grid>
        </>
      ) : (
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
              {...filterProps}
            />
          </Grid>
        </Grid>
      )}
      {hiddenMarketCount != null && !isMobile && (
        <Tooltip title={tooltip}>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <ChipGridItem {...(!isMobile && { alignRight: true })}>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="bodyXsRegular">{t`Hidden`}</Typography>
                <Typography variant="highlightS">{hiddenMarketCount}</Typography>
              </Stack>
            </ChipGridItem>
            {hasFilters && (
              <ChipGridItem alignRight>
                <ResetFiltersButton onClick={resetFilters} />
              </ChipGridItem>
            )}
          </Grid>
        </Tooltip>
      )}
    </Grid>
  )
}
