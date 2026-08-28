import { useConnection } from 'wagmi'
import {
  useGaugeDepositRewardIsApproved,
  useDepositReward,
  gaugeDepositRewardValidationGroup,
  useDepositRewardEstimateGas,
  useGaugeRewardsDistributors,
} from '@/dex/entities/gauge'
import { useNetworks } from '@/dex/entities/networks'
import { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { AmountTokenInput, EpochInput } from '@/dex/features/deposit-gauge-reward/ui'
import { ChainId } from '@/dex/types/main.types'
import { FormButton, useForm, useFormSync } from '@evm-ui/features/forms'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { ActionInfo, ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { q } from '@evm-ui/types/util'
import { decimalMultiply, formatNumber, TIME_FRAMES } from '@evm-ui/utils'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { BlockSkeleton } from '@legacy-ui/skeleton'
import Stack from '@mui/material/Stack'
import { maybes } from '@primitives/objects.utils'

const { Spacing } = SizesAndSpaces

const validation = createValidationSuite((data: DepositRewardFormValues) => gaugeDepositRewardValidationGroup(data))

const defaultValues = {
  rewardTokenId: undefined,
  amount: undefined,
  userBalance: undefined,
  epoch: TIME_FRAMES.WEEK,
} as const

export const DepositReward = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { data: networks } = useNetworks()
  const network = networks[chainId]
  const { address: userAddress } = useConnection()
  const { isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress,
  })

  const form = useForm<DepositRewardFormValues>({ validation, defaultValues })
  const { errors, isValid, visibleErrors } = form.formState
  const { rewardTokenId, amount, epoch } = form.watchValues()

  const { data: userBalance } = useTokenBalance({ chainId, userAddress, tokenAddress: rewardTokenId })
  const { data: tokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: rewardTokenId })
  const gas = useDepositRewardEstimateGas(networks, { chainId, poolId, rewardTokenId, amount, epoch, userBalance })
  const depositReward = useDepositReward({ chainId, poolId })
  const isApproved = useGaugeDepositRewardIsApproved({ chainId, poolId, rewardTokenId, amount, userBalance })
  const isPending = form.formState.isSubmitting || depositReward.isPending
  const isLoading = isPending || isApproved.isLoading

  useFormSync(form, { userBalance }) // Sync userBalance from query into form for validation

  return isPendingRewardDistributors ? (
    <BlockSkeleton height={440} />
  ) : (
    <Form
      {...form}
      onSubmit={form.handleSubmit(depositReward.mutate)}
      footer={
        <Stack sx={{ gap: Spacing.xs }}>
          <ActionInfo
            label={t`Reward value`}
            value={formatNumber(maybes([amount, tokenUsdRate], decimalMultiply), 'usd.amount')}
            valueTooltip={tokenUsdRate && `${t`Token price`}: ${formatNumber(tokenUsdRate, 'usd.amount')}`}
            size="small"
          />
          <ActionInfoGasEstimate gas={q(gas)} isApproved={isApproved.data} />
        </Stack>
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <AmountTokenInput chainId={chainId} poolId={poolId} networkId={network.id} disabled={isPending} />
        <EpochInput disabled={isPending} />
        <FormButton
          pending={isPending}
          loading={isLoading}
          disabled={!isValid || isLoading}
          label={[isApproved.data === false && t`Approve`, t`Deposit`]}
          testId="deposit-reward-submit-button"
          connectWalletTestId="deposit-reward-connect-wallet-button"
        />
        <FormAlerts
          error={errors['root.serverError'] ?? depositReward.error}
          formErrors={visibleErrors}
          handledErrors={['rewardTokenId', 'amount', 'epoch']}
        />
      </Stack>
    </Form>
  )
}
