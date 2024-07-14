import AlertFormError from '@/components/AlertFormError'
import DetailInfoEstGas from '@/components/DetailInfoEstGas'
import { useEstimateGasAddRewardToken } from '@/entities/gauge'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { ErrorContainer, StyledButton } from './styled'

export const FormActions: React.FC<{ chainId: ChainId; poolId: string; disabled: boolean; loading: boolean }> = ({
  chainId,
  poolId,
  disabled,
  loading,
}) => {
  const {
    formState: { errors, isValid },
    watch,
    clearErrors,
  } = useFormContext()
  const rewardToken = watch('rewardToken')
  const distributor = watch('distributor')

  const { data: estimatedGas, isPending: isPendingGasEstimate } = useEstimateGasAddRewardToken(
    poolId,
    rewardToken,
    distributor
  )

  return (
    <>
      <DetailInfoEstGas chainId={chainId} estimatedGas={estimatedGas ?? null} loading={isPendingGasEstimate} />

      <ErrorContainer>
        <ErrorMessage
          errors={errors}
          name="rewardToken"
          render={({ message }) => (
            <AlertFormError errorKey={message} handleBtnClose={() => clearErrors('rewardToken')} />
          )}
        />
        <ErrorMessage
          errors={errors}
          name="distributor"
          render={({ message }) => (
            <AlertFormError errorKey={message} handleBtnClose={() => clearErrors('distributor')} />
          )}
        />
        <ErrorMessage
          errors={errors}
          name="root.serverError"
          render={({ message }) => (
            <AlertFormError errorKey={message} handleBtnClose={() => clearErrors('root.serverError')} />
          )}
        />
      </ErrorContainer>

      <StyledButton disabled={!isValid || disabled} loading={loading} variant="filled" size="medium">
        {t`Add Reward`}
      </StyledButton>
    </>
  )
}
