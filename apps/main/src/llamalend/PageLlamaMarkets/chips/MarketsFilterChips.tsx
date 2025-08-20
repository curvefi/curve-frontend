import { type ReactNode } from 'react'
import { ChipGridItem } from '@/llamalend/PageLlamaMarkets/chips/ChipGridItem'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type MarketsFilterChipsProps = {
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
}: MarketsFilterChipsProps) => {
  const tooltip =
    !hasFilters && hiddenMarketCount
      ? t`Some markets are hidden by default due to low liquidity. You may change that in the liquidity filter.`
      : null

  const isMobile = useIsMobile()
  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.lg}>
      {!isMobile && <TableSearchField value={searchText} onChange={onSearch} />}
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
