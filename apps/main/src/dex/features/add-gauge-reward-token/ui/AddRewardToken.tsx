import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { useAddRewardToken, useAddRewardTokenEstimateGas } from '@/dex/entities/gauge/lib'
import { gaugeAddRewardValidationGroup } from '@/dex/entities/gauge/model/gauge-validation'
import { useGaugeRewardsDistributors, useIsDepositRewardAvailable } from '@/dex/entities/gauge/model/query-options'
import type { AddRewardParams } from '@/dex/entities/gauge/types'
import { useNetworks } from '@/dex/entities/networks'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { DistributorInput, TokenSelector } from '@/dex/features/add-gauge-reward-token/ui'
import { ChainId } from '@/dex/types/main.types'
import { FormButton, useForm, useFormSync } from '@evm-ui/features/forms'
import { createValidationSuite } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfoGasEstimate } from '@evm-ui/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { q } from '@evm-ui/types/util'
import { Form } from '@evm-ui/widgets/DetailPageLayout/Form'
import { FormAlerts } from '@evm-ui/widgets/DetailPageLayout/FormAlerts'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanTxPath } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

const validation = createValidationSuite((data: AddRewardParams) => gaugeAddRewardValidationGroup(data))

export const AddRewardToken = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { data: networks } = useNetworks()
  const { address: userAddress } = useConnection()
  const { isLoading: isLoadingDistributors } = useGaugeRewardsDistributors({ chainId, poolId, userAddress })
  const { data: isRewardsAvailable, isLoading: isLoadingRewards } = useIsDepositRewardAvailable({ chainId, poolId })
  const network = networks[chainId]

  const form = useForm<AddRewardFormValues>({
    validation,
    defaultValues: { rewardTokenId: undefined, distributorId: undefined },
  })
  const { setError, formState, handleSubmit } = form
  const { errors, visibleErrors, isValid, isSubmitting } = formState

  useFormSync(form, { distributorId: userAddress }, !!userAddress && !form.isTouched('distributorId'))

  const gas = useAddRewardTokenEstimateGas(networks, { chainId, poolId, ...form.watchValues() }, isValid)

  const {
    mutate: addRewardToken,
    isPending: isPendingAddRewardToken,
    isSuccess: isSuccessAddRewardToken,
    data: addRewardTokenData,
  } = useAddRewardToken({ chainId, poolId })

  const onSubmit = useCallback(
    ({ rewardTokenId, distributorId }: AddRewardFormValues) => {
      addRewardToken(
        { rewardTokenId, distributorId },
        { onError: (error: Error) => setError('root.serverError', { type: 'manual', message: error.message }) },
      )
    },
    [addRewardToken, setError],
  )

  const isLoading = isSubmitting || isLoadingDistributors || isLoadingRewards || isPendingAddRewardToken
  const isDisabled = isLoading || !isRewardsAvailable

  return (
    <Form {...form} onSubmit={handleSubmit(onSubmit)} footer={<ActionInfoGasEstimate gas={q(gas)} />}>
      <Stack sx={{ gap: Spacing.sm }}>
        <Stack direction={{ mobile: 'column', tablet: 'row' }} sx={{ gap: Spacing.sm }}>
          <TokenSelector chainId={chainId} poolId={poolId} userAddress={userAddress} disabled={isDisabled} />
          <DistributorInput disabled={isDisabled} />
        </Stack>
        <FormButton
          disabled={isDisabled || !isValid}
          loading={isLoading}
          label={t`Add Reward`}
          testId="add-reward-submit-button"
          connectWalletTestId="add-reward-connect-wallet-button"
        />
        {isSuccessAddRewardToken && addRewardTokenData && (
          <TxInfoBar description={t`Reward token added`} txHash={scanTxPath(network, addRewardTokenData)} />
        )}
        <FormAlerts error={errors['root.serverError']} formErrors={visibleErrors} handledErrors={['distributorId']} />
      </Stack>
    </Form>
  )
}
