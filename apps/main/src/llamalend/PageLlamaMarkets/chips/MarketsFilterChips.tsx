import { type ReactNode } from 'react'
import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import { ChipGridItem } from '@/llamalend/PageLlamaMarkets/chips/ChipGridItem'
import { GridChip } from '@/llamalend/PageLlamaMarkets/chips/GridChip'
import { useMarketTypeFilter } from '@/llamalend/PageLlamaMarkets/hooks/useMarketTypeFilter'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { type FilterProps, ResetFiltersButton } from '@ui-kit/shared/ui/DataTable'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ColumnFilterProps = FilterProps<LlamaMarketKey>

type MarketsFilterChipsProps = ColumnFilterProps & {
  hiddenMarketCount?: number
  resetFilters: () => void
  searchText: string
  hasFilters: boolean
  onSearch: (value: string) => void
  children?: ReactNode
}

export const MarketsFilterChips = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  searchText,
  onSearch,
  children,
  ...props
}: MarketsFilterChipsProps) => {
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  const tooltip =
    !hasFilters && hiddenMarketCount
      ? t`Some markets are hidden by default due to low liquidity. You may change that in the liquidity filter.`
      : null

  const isMobile = useIsMobile()
  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.lg}>
      {!useIsMobile() && <TableSearchField value={searchText} onChange={onSearch} />}
      <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
        <GridChip
          label={t`Mint Markets`}
          selected={marketTypes.Mint}
          toggle={toggleMarkets.Mint}
          data-testid="chip-mint"
        />
        <GridChip
          label={t`Lend Markets`}
          selected={marketTypes.Lend}
          toggle={toggleMarkets.Lend}
          data-testid="chip-lend"
        />
      </Grid>
      {children}

      {hiddenMarketCount != null && (
        <Tooltip title={tooltip}>
          <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
            <ChipGridItem {...(!isMobile && { alignRight: true })}>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="bodyXsRegular">{t`Hidden`}</Typography>
                <Typography variant="highlightS">{hiddenMarketCount}</Typography>
              </Stack>
            </ChipGridItem>
            <ChipGridItem alignRight>
              <ResetFiltersButton onClick={resetFilters} hidden={!hasFilters} />
            </ChipGridItem>
          </Grid>
        </Tooltip>
      )}
    </Grid>
  )
}
