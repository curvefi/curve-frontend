import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

type HiddenMarketsResetFiltersProps = {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
}

export const HiddenMarketsResetFilters = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
}: HiddenMarketsResetFiltersProps) => {
  const tooltip: string = // do not leave this tooltip empty, it breaks the reset filter transition
    !hasFilters && hiddenMarketCount
      ? [
          t`Some markets are hidden by default due to low TVL.`,
          t`You may change that in the TVL filter.`,
          t`Note that deprecated markets are only visible for users that have an active position.`,
        ].join(' ')
      : hasFilters
        ? t`You have active filters.`
        : t`All markets are being displayed`

  return (
    <Tooltip title={tooltip}>
      <Stack direction="row" gap={{ mobile: 2, tablet: 1 }} alignItems="center" sx={{ marginLeft: 'auto' }}>
        <Stack direction="row" gap={1} alignItems="center">
          <Typography variant="bodyXsRegular">{t`Hidden`}:</Typography>
          <Typography variant="highlightS" data-testid="hidden-market-count">
            {hiddenMarketCount ?? '-'}
          </Typography>
        </Stack>
        <ResetFiltersButton onClick={resetFilters} hidden={!hasFilters} />
      </Stack>
    </Tooltip>
  )
}
