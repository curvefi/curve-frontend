import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const RefuelActionInfos = () => (
  <Stack gap={Spacing.xs}>
    <ActionInfo label={t`Estimated tx cost`} value="- ETH" size="small" testId="refuel-estimated-tx-cost" />

    <Stack>
      <ActionInfo label={t`Estimated refuel costs`} value="" size="small" testId="refuel-estimated-costs" />
      <ActionInfo label={t`Weekly`} value="$639.92k" size="small" testId="refuel-weekly" />
      <ActionInfo label={t`Monthly`} value="$2.56M" size="small" testId="refuel-monthly" />
      <ActionInfo label={t`Yearly`} value="$2.56M" size="small" testId="refuel-yearly" />
    </Stack>
  </Stack>
)
