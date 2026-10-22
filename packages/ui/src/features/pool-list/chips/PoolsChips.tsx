import Grid from '@mui/material/Grid'
import { Tooltip } from '@ui/components/Tooltip'
import { GridChip } from '@ui/features/tables/chips/GridChip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ActiveIcon } from '@ui/icons/ActiveIcon'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const PoolsChips = ({
  activePoolsFilter,
  isLite,
}: {
  activePoolsFilter: { isSelected: boolean; toggle: () => void }
  isLite: boolean
}) => (
  <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
    <Tooltip
      title={t`Active pools`}
      body={
        isLite
          ? t`Only show pools with TVL above $0.`
          : t`Only show pools with TVL above $0 that are at least 3 days old.`
      }
      placement="top"
    >
      <GridChip
        label={t`Active`}
        selected={activePoolsFilter.isSelected}
        aria-pressed={activePoolsFilter.isSelected}
        selectableChipSize="medium"
        variant="ghost"
        toggle={activePoolsFilter.toggle}
        icon={<ActiveIcon />}
        data-testid="chip-active"
      />
    </Tooltip>
  </Grid>
)
