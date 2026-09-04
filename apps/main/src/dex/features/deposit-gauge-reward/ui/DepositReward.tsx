import { useConnection } from 'wagmi'
import { useDepositReward } from '@/dex/entities/gauge/lib/reward-actions'
import { useDepositRewardEstimateGas } from '@/dex/entities/gauge/model/gauge-gas.query'
import { gaugeDepositRewardValidationGroup } from '@/dex/entities/gauge/model/gauge-validation'
import { useGaugeDepositRewardIsApproved } from '@/dex/entities/gauge/model/gauge.query'
import { useNetworks } from '@/dex/entities/networks'
import { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { AmountTokenInput, EpochInput } from '@/dex/features/deposit-gauge-reward/ui'
import { FormButton, useForm, useFormSync } from '@evm-ui/features/forms'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { useTokenUsdRate } from '@evm-ui/lib/model/entities/token-usd-rate'
import { createValidationSuite } from '@evm-ui/lib/validation'
import { ActionInfo, ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { decimalMultiply, formatNumber } from '@evm-ui/utils'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Stack from '@mui/material/Stack'
import { maybes } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { TIME_FRAMES } from '@ui/utils/time'
import { usePoolContext } from '../../pool-context'

const { Spacing } = SizesAndSpaces

const validation = createValidationSuite((data: DepositRewardFormValues) => gaugeDepositRewardValidationGroup(data))

const defaultValues = {
  rewardTokenId: undefined,
  amount: undefined,
  userBalance: undefined,
  epoch: TIME_FRAMES.WEEK,
} as const

export const DepositReward = () => {
  const { chainId, poolId } = usePoolContext()
  const { data: networks } = useNetworks()
  const network = networks[chainId]
  const { address: userAddress } = useConnection()

  const form = useForm<DepositRewardFormValues>({ validation, defaultValues })
  const { errors, isValid, visibleErrors } = form.formState
  const { rewardTokenId, amount, epoch } = form.watchValues()

  const { data: userBalance } = useTokenBalance({ chainId, userAddress, tokenAddress: rewardTokenId })
  const { data: tokenUsdRate } = useTokenUsdRate({ chainId, tokenAddress: rewardTokenId })
  const gas = useDepositRewardEstimateGas({ chainId, poolId, rewardTokenId, amount, epoch, userBalance })
  const {
    onSubmit,
    error: depositRewardError,
    isPending: isPendingDepositReward,
  } = useDepositReward({ chainId, poolId, onReset: () => form.reset(defaultValues) })
  const { data: isApproved, isLoading: isLoadingApproved } = useGaugeDepositRewardIsApproved({
    chainId,
    poolId,
    rewardTokenId,
    amount,
    userBalance,
  })
  const isPending = form.formState.isSubmitting || isPendingDepositReward
  const isLoading = isPending || isLoadingApproved

  useFormSync(form, { userBalance }) // Sync userBalance from query into form for validation

  return (
    <Form
      {...form}
      onSubmit={form.handleSubmit(onSubmit)}
      footer={
        <Stack sx={{ gap: Spacing.xs }}>
          <ActionInfo
            label={t`Reward value`}
            value={formatNumber(maybes([amount, tokenUsdRate], decimalMultiply), 'usd.amount')}
            valueTooltip={tokenUsdRate && `${t`Token price`}: ${formatNumber(tokenUsdRate, 'usd.amount')}`}
            size="small"
          />
          <ActionInfoGasEstimate gas={q(gas)} isApproved={isApproved} />
        </Stack>
      }
    >
      <Stack sx={{ gap: Spacing.sm }}>
        <AmountTokenInput chainId={chainId} poolId={poolId} blockchainId={network.blockchainId} disabled={isPending} />
        <EpochInput disabled={isPending} />
        <FormButton
          pending={isPending}
          loading={isLoading}
          disabled={!isValid || isLoading}
          label={[isApproved === false && t`Approve`, t`Deposit`]}
          testId="deposit-reward-submit-button"
          connectWalletTestId="deposit-reward-connect-wallet-button"
        />
        <FormAlerts
          error={errors['root.serverError'] ?? depositRewardError}
          formErrors={visibleErrors}
          handledErrors={['rewardTokenId', 'amount', 'epoch']}
        />
      </Stack>
    </Form>
  )
}
