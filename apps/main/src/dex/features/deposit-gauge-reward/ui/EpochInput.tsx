import { useCallback } from 'react'
import { useDepositRewardApproveIsMutating, useDepositRewardIsMutating } from '@/dex/entities/gauge'
import type { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { ChainId } from '@/dex/types/main.types'
import { useFormContext } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { TIME_FRAMES } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const { Spacing } = SizesAndSpaces

export const EpochInput = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { update: updateForm, formState, watchValue } = useFormContext<DepositRewardFormValues>()
  const rewardTokenId = watchValue('rewardTokenId')
  const amount = watchValue('amount')
  const epoch = watchValue('epoch')

  const onEpochChange = useCallback(
    (epoch: string) => updateForm({ epoch: parseInt(epoch) * TIME_FRAMES.WEEK }),
    [updateForm],
  )

  const isPendingDepositRewardApprove = useDepositRewardApproveIsMutating({ chainId, poolId, rewardTokenId, amount })
  const isPendingDepositReward = useDepositRewardIsMutating({ chainId, poolId, rewardTokenId, amount, epoch })

  const isDisabled = isPendingDepositReward || isPendingDepositRewardApprove
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
          disabled={isDisabled}
          error={!!formState.errors.epoch}
          sx={{ width: '7.75rem' }}
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
