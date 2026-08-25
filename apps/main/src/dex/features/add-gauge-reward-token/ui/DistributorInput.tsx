import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useFormContext } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'

const { Spacing } = SizesAndSpaces

export const DistributorInput = ({ disabled }: { disabled: boolean }) => {
  const { update: updateForm, formState, watchValue } = useFormContext<AddRewardFormValues>()
  const distributorId = watchValue('distributorId')
  const distributorError = formState.visibleErrors.find(([field]) => field === 'distributorId')?.[1]

  return (
    <Stack sx={{ flex: 1, gap: Spacing.xxs }}>
      <Typography variant="headingXsBold">{t`Distributor`}</Typography>
      <TextField
        id="inpDistributor"
        value={distributorId ?? ''}
        onChange={event => updateForm({ distributorId: event.target.value as Address })}
        disabled={disabled}
        error={!!distributorError}
        helperText={distributorError}
      />
    </Stack>
  )
}
