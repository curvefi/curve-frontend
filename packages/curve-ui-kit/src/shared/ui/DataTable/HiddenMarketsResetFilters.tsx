import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

type HiddenMarketsResetFiltersProps = {
  hiddenCount: number
  resetFilters: () => void
}

export const HiddenMarketsResetFilters = ({ hiddenCount, resetFilters }: HiddenMarketsResetFiltersProps) => (
  <Tooltip
    title={
      // do not leave this tooltip empty, it breaks the reset filter transition
      hiddenCount
        ? `${t`You have active filters.`} (${t`small markets are hidden by default due to low TVL.`})`
        : t`All markets are being displayed`
    }
  >
    <Stack direction="row" gap={{ mobile: 2, tablet: 1 }} alignItems="center" sx={{ marginLeft: 'auto' }}>
      <Stack direction="row" gap={1} alignItems="center">
        <Typography variant="bodyXsRegular">{t`Hidden`}:</Typography>
        <Typography variant="highlightS" data-testid="hidden-market-count">
          {hiddenCount ?? '-'}
        </Typography>
      </Stack>
      <ResetFiltersButton onClick={resetFilters} hidden={!hiddenCount} />
    </Stack>
  </Tooltip>
)
