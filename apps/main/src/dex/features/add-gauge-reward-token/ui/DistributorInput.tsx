import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

export const DistributorInput = ({
  form: { update: updateForm, formState, values },
  disabled,
}: {
  form: UseFormReturn<AddRewardFormValues>
  disabled: boolean
}) => {
  const distributorError = formState.visibleErrors.find(([field]) => field === 'distributorId')?.[1]
  return (
    <Stack sx={{ flex: 1, gap: Spacing.xxs }}>
      <Typography variant="headingXsBold">{t`Distributor`}</Typography>
      <TextField
        id="inpDistributor"
        slotProps={{ htmlInput: { 'data-testid': 'add-reward-distributor-input' } }}
        value={values.distributorId ?? ''}
        onChange={event => updateForm({ distributorId: event.target.value as Address })}
        disabled={disabled}
        error={!!distributorError}
        helperText={distributorError}
      />
    </Stack>
  )
}
