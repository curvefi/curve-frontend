import { ResetFiltersButton } from '@evm-ui/shared/ui/DataTable/ResetFiltersButton'
import { Stack, Typography } from '@mui/material'
import { Tooltip } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

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
    <Stack
      direction="row"
      sx={{
        gap: { mobile: 2, tablet: 1 },
        alignItems: 'center',
        marginLeft: 'auto',
      }}
    >
      <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'center' }}>
        <Typography variant="bodyXsRegular">{t`Hidden`}:</Typography>
        <Typography variant="highlightS" data-testid="hidden-market-count">
          {hiddenCount}
        </Typography>
      </Stack>
      <ResetFiltersButton onClick={resetFilters} hidden={!hiddenCount} />
    </Stack>
  </Tooltip>
)
