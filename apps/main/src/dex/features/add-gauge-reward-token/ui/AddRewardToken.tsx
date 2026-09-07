import { useConnection } from 'wagmi'
import { useAddRewardToken } from '@/dex/entities/gauge/lib/reward-actions'
import { useAddRewardTokenEstimateGas } from '@/dex/entities/gauge/model/gauge-gas.query'
import { gaugeAddRewardValidationGroup } from '@/dex/entities/gauge/model/gauge-validation'
import { useGaugeRewardsDistributors, useIsDepositRewardAvailable } from '@/dex/entities/gauge/model/gauge.query'
import type { AddRewardParams } from '@/dex/entities/gauge/types'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { DistributorInput, TokenSelector } from '@/dex/features/add-gauge-reward-token/ui'
import { ChainId } from '@/dex/types/main.types'
import { EvmFormButton } from '@evm-ui/features/forms/EvmFormButton'
import { createValidationSuite } from '@evm-ui/lib'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import Stack from '@mui/material/Stack'
import { useForm, useFormSync } from '@ui/features/forms'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

const validation = createValidationSuite((data: AddRewardParams) => gaugeAddRewardValidationGroup(data))

export const AddRewardToken = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { address: userAddress } = useConnection()
  const { isLoading: isLoadingDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress })
  const { data: isRewardsAvailable, isLoading: isLoadingRewards } = useIsDepositRewardAvailable({ chainId, poolId })

  const form = useForm<AddRewardFormValues>({
    validation,
    defaultValues: { rewardTokenId: undefined, distributorId: undefined },
  })
  const { formState, handleSubmit } = form
  const { errors, visibleErrors, isValid, isSubmitting } = formState

  useFormSync(form, { distributorId: userAddress }, !!userAddress && !form.isTouched('distributorId'))

  const gas = useAddRewardTokenEstimateGas({ chainId, poolId, ...form.watchValues() }, isValid)

  const {
    onSubmit,
    error: addRewardTokenError,
    isPending: isPendingAddRewardToken,
  } = useAddRewardToken({
    chainId,
    poolId,
    onReset: () => form.reset({ rewardTokenId: undefined }), // keep distributor in case of adding multiple rewards
  })

  const isLoading = isSubmitting || isLoadingDistributors || isLoadingRewards || isPendingAddRewardToken
  const isDisabled = isLoading || !isRewardsAvailable

  return (
    <Form {...form} onSubmit={handleSubmit(onSubmit)} footer={<ActionInfoGasEstimate gas={q(gas)} />}>
      <Stack sx={{ gap: Spacing.sm }}>
        <Stack direction={{ mobile: 'column', tablet: 'row' }} sx={{ gap: Spacing.sm }}>
          <TokenSelector chainId={chainId} poolId={poolId} userAddress={userAddress} disabled={isDisabled} />
          <DistributorInput disabled={isDisabled} />
        </Stack>
        <EvmFormButton
          disabled={isDisabled || !isValid}
          loading={isLoading}
          label={t`Add Reward`}
          testId="add-reward-submit-button"
          connectWalletTestId="add-reward-connect-wallet-button"
        />
        <FormAlerts
          error={errors['root.serverError'] ?? addRewardTokenError}
          formErrors={visibleErrors}
          handledErrors={['distributorId']}
          userAddress={userAddress}
        />
      </Stack>
    </Form>
  )
}
