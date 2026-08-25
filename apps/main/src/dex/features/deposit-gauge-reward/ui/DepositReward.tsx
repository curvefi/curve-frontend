import { useConnection } from 'wagmi'
import { useDepositRewardEstimateGas, useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { useNetworks } from '@/dex/entities/networks'
import { DepositRewardDefaultValues, depositRewardValidationSuite } from '@/dex/features/deposit-gauge-reward/model'
import { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { AmountTokenInput, DepositStepper, EpochInput, HelperFields } from '@/dex/features/deposit-gauge-reward/ui'
import { ChainId } from '@/dex/types/main.types'
import { useFormSync, useForm } from '@evm-ui/features/forms'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { BlockSkeleton } from '@legacy-ui/skeleton'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

export const DepositReward = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { address: signerAddress } = useConnection()
  const { isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress: signerAddress,
  })

  const form = useForm<DepositRewardFormValues>({
    validation: depositRewardValidationSuite,
    defaultValues: DepositRewardDefaultValues,
  })

  const tokenAddress = form.watchValue('rewardTokenId')
  const amount = form.watchValue('amount')
  const epoch = form.watchValue('epoch')
  const { address: userAddress } = useConnection()
  const { data: userBalance } = useTokenBalance({ chainId, userAddress, tokenAddress })
  const { data: networks } = useNetworks()
  const gas = useDepositRewardEstimateGas(
    networks,
    { chainId, poolId, rewardTokenId: tokenAddress, amount, epoch, userBalance },
    form.formState.isValid,
  )

  // Sync userBalance from query into form for validation
  useFormSync(form, { userBalance })

  if (isPendingRewardDistributors) {
    return <BlockSkeleton height={440} />
  }

  return (
    <Form
      {...form}
      onSubmit={() => undefined}
      footer={
        <Stack sx={{ gap: Spacing.xs }}>
          <HelperFields />
          <ActionInfoGasEstimate gas={q(gas)} />
        </Stack>
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <AmountTokenInput chainId={chainId} poolId={poolId} />
        <EpochInput chainId={chainId} poolId={poolId} />
        <DepositStepper chainId={chainId} poolId={poolId} />
        <FormAlerts
          error={form.formState.errors['root.serverError'] ?? null}
          formErrors={form.formState.visibleErrors}
          handledErrors={['rewardTokenId', 'amount', 'epoch']}
        />
      </Stack>
    </Form>
  )
}
