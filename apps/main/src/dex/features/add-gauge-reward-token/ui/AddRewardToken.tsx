import { useCallback } from 'react'
import { zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import {
  useAddRewardToken,
  useAddRewardTokenEstimateGas,
  useGaugeRewardsDistributors,
  useIsDepositRewardAvailable,
} from '@/dex/entities/gauge'
import { useNetworkByChain, useNetworks } from '@/dex/entities/networks'
import { addGaugeRewardTokenValidationSuite } from '@/dex/features/add-gauge-reward-token/model'
import type { AddRewardFormValues, AddRewardTokenProps } from '@/dex/features/add-gauge-reward-token/types'
import { DistributorInput, FormActions, TokenSelector } from '@/dex/features/add-gauge-reward-token/ui'
import { useForm } from '@evm-ui/features/forms'
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

export const AddRewardToken = ({ chainId, poolId }: AddRewardTokenProps) => {
  const { address: signerAddress } = useConnection()

  const { isFetching: isFetchingGaugeRewardsDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress: signerAddress,
  })

  const { data: isDepositRewardAvailable, isFetching: isFetchingIsDepositRewardAvailable } =
    useIsDepositRewardAvailable({ chainId, poolId })

  const form = useForm<AddRewardFormValues>({
    validation: addGaugeRewardTokenValidationSuite,
    defaultValues: {
      rewardTokenId: zeroAddress,
      distributorId: signerAddress ?? zeroAddress,
    },
  })
  const {
    setError,
    formState: { isSubmitting },
    handleSubmit,
  } = form

  const {
    mutate: addRewardToken,
    isPending: isPendingAddRewardToken,
    isSuccess: isSuccessAddRewardToken,
    data: addRewardTokenData,
  } = useAddRewardToken({ chainId, poolId })

  const { data: network } = useNetworkByChain({ chainId })

  const onSubmit = useCallback(
    ({ rewardTokenId, distributorId }: AddRewardFormValues) => {
      addRewardToken(
        { rewardTokenId, distributorId },
        {
          onError: (error: Error) => {
            setError('root.serverError', { type: 'manual', message: error.message })
          },
        },
      )
    },
    [addRewardToken, setError],
  )

  const isFormDisabled = !isDepositRewardAvailable

  const isFormLoading =
    isSubmitting || isFetchingGaugeRewardsDistributors || isFetchingIsDepositRewardAvailable || isPendingAddRewardToken
  const rewardTokenId = form.watchValue('rewardTokenId')
  const distributorId = form.watchValue('distributorId')
  const { data: networks } = useNetworks()
  const gas = useAddRewardTokenEstimateGas(
    networks,
    { chainId, poolId, rewardTokenId, distributorId },
    form.formState.isValid,
  )

  return (
    <Form {...form} onSubmit={handleSubmit(onSubmit)} footer={<ActionInfoGasEstimate gas={q(gas)} />}>
      <Stack sx={{ gap: Spacing.sm }}>
        <Stack direction={{ mobile: 'column', tablet: 'row' }} sx={{ gap: Spacing.sm }}>
          <TokenSelector chainId={chainId} poolId={poolId} disabled={isFormLoading || isFormDisabled} />
          <DistributorInput disabled={isFormLoading || isFormDisabled} />
        </Stack>
        <FormActions chainId={chainId} poolId={poolId} />
        {isSuccessAddRewardToken && addRewardTokenData && (
          <TxInfoBar description={t`Reward token added`} txHash={scanTxPath(network, addRewardTokenData)} />
        )}
        <FormAlerts
          error={form.formState.errors['root.serverError'] ?? null}
          formErrors={form.formState.visibleErrors}
          handledErrors={['distributorId']}
        />
      </Stack>
    </Form>
  )
}
