import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zeroAddress } from 'viem'
import AlertFormError from '@/dex/components/AlertFormError'
import { useAddRewardToken, useGaugeRewardsDistributors, useIsDepositRewardAvailable } from '@/dex/entities/gauge'
import { useSignerAddress } from '@/dex/entities/signer'
import { addGaugeRewardTokenValidationSuite } from '@/dex/features/add-gauge-reward-token/model'
import type { AddRewardFormValues, AddRewardTokenProps } from '@/dex/features/add-gauge-reward-token/types'
import {
  DistributorInput,
  EstimatedGasInfo,
  FormActions,
  TokenSelector,
} from '@/dex/features/add-gauge-reward-token/ui'
import useStore from '@/dex/store/useStore'
import { vestResolver } from '@hookform/resolvers/vest'
import { FormErrorsDisplay } from '@ui/FormErrorsDisplay'
import { FlexContainer, FormContainer, FormFieldsContainer } from '@ui/styled-containers'
import TxInfoBar from '@ui/TxInfoBar'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions } from '@ui-kit/lib/model/form'

export const AddRewardToken = ({ chainId, poolId }: AddRewardTokenProps) => {
  const { data: signerAddress } = useSignerAddress()

  const { isFetching: isFetchingGaugeRewardsDistributors } = useGaugeRewardsDistributors({ chainId, poolId })

  const { data: isDepositRewardAvailable, isFetching: isFetchingIsDepositRewardAvailable } =
    useIsDepositRewardAvailable({ chainId, poolId })

  const methods = useForm<AddRewardFormValues>({
    ...formDefaultOptions,
    resolver: vestResolver(addGaugeRewardTokenValidationSuite),
    defaultValues: {
      rewardTokenId: zeroAddress,
      distributorId: signerAddress ?? zeroAddress,
    },
  })
  const {
    setError,
    formState: { isSubmitting },
    handleSubmit,
  } = methods

  const {
    mutate: addRewardToken,
    isPending: isPendingAddRewardToken,
    isSuccess: isSuccessAddRewardToken,
    data: addRewardTokenData,
  } = useAddRewardToken({ chainId, poolId })

  const network = useStore((state) => state.networks.networks[chainId])

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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormContainer>
          <FormFieldsContainer>
            <FlexContainer>
              <TokenSelector chainId={chainId} poolId={poolId} disabled={isFormLoading || isFormDisabled} />
              <DistributorInput disabled={isFormLoading || isFormDisabled} />
            </FlexContainer>
          </FormFieldsContainer>
          <FormErrorsDisplay errorKeys={['rewardTokenId', 'distributorId']} component={AlertFormError} />
          <EstimatedGasInfo chainId={chainId} poolId={poolId} />
          <FormActions chainId={chainId} poolId={poolId} />
          {isSuccessAddRewardToken && addRewardTokenData && (
            <TxInfoBar description={t`Reward token added`} txHash={network.scanTxPath(addRewardTokenData)} />
          )}
          <FormErrorsDisplay errorKeys={['root.serverError']} component={AlertFormError} />
        </FormContainer>
      </form>
    </FormProvider>
  )
}
