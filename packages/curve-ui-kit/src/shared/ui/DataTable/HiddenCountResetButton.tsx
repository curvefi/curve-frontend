import { Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { ResetFiltersButton } from '@ui-kit/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const HiddenCountResetButton = ({
  hiddenCount,
  resetFilters,
  filterTooltip = t`You have active filters.`,
}: {
  hiddenCount: number
  resetFilters: () => void
  filterTooltip?: string
}) => (
  <Tooltip
    title={
      // do not leave this tooltip empty, it breaks the reset filter transition
      hiddenCount ? filterTooltip : t`All the available data is being displayed`
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
