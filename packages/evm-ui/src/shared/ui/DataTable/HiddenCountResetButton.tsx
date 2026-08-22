import { t } from '@evm-ui/lib/i18n'
import { ResetFiltersButton } from '@evm-ui/shared/ui/DataTable/ResetFiltersButton'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { Stack, Typography } from '@mui/material'

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
