import { useCallback } from 'react'
import type { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useFormContext } from '@evm-ui/features/forms'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { TIME_FRAMES } from '@ui/utils/time'

const { Spacing } = SizesAndSpaces

export const EpochInput = ({ disabled }: { disabled: boolean }) => {
  const { update: updateForm, formState, watchValues } = useFormContext<DepositRewardFormValues>()
  const { epoch } = watchValues()

  const onEpochChange = useCallback(
    (epoch: string) => updateForm({ epoch: parseInt(epoch) * TIME_FRAMES.WEEK }),
    [updateForm],
  )

  const epochError = formState.visibleErrors.find(([field]) => field === 'epoch')?.[1]

  return (
    <Stack sx={{ gap: Spacing.xxs }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, flexWrap: 'wrap' }}
      >
        <Typography variant="bodyMBold">{t`Distribution duration (in weeks)`}</Typography>
        <TextField
          id="deposit-epoch"
          type="number"
          value={String((epoch ?? 0) / TIME_FRAMES.WEEK)}
          onChange={event => onEpochChange(event.target.value)}
          disabled={disabled}
          error={!!formState.errors.epoch}
          slotProps={{ htmlInput: { 'data-testid': 'deposit-epoch' } }}
        />
      </Stack>
      {epochError && (
        <Typography variant="bodyXsRegular" color="error">
          {epochError}
        </Typography>
      )}
    </Stack>
  )
}
