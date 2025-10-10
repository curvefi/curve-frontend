import { type ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChipGridItem } from './ChipGridItem'

const { Spacing } = SizesAndSpaces

type MarketsFilterChipsProps = {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  children?: ReactNode
}

export const MarketFilterChipWrapper = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  children,
}: MarketsFilterChipsProps) => {
  const tooltip =
    !hasFilters && hiddenMarketCount
      ? [
          t`Some markets are hidden by default due to low TVL.`,
          t`Deprecated markets are only visible for users that have an active position.`,
          t`You may change that in the TVL filter.`,
        ].join(' ')
      : null

  const isMobile = useIsMobile()
  return (
    <Grid container rowSpacing={Spacing.xs} columnSpacing={Spacing.lg}>
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
