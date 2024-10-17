import { FormErrorsDisplay } from '@/ui/FormErrorsDisplay'
import { vestResolver } from '@hookform/resolvers/vest'
import { FormProvider, useForm } from 'react-hook-form'
import AlertFormError from '@/components/AlertFormError'
import { DepositRewardDefaultValues, depositRewardValidationSuite } from '@/features/deposit-gauge-reward/model'
import { DepositRewardFormValues } from '@/features/deposit-gauge-reward/types'
import {
  AmountTokenInput,
  DepositStepper,
  EpochInput,
  GasEstimation,
  HelperFields,
} from '@/features/deposit-gauge-reward/ui'
import { useGaugeRewardsDistributors } from '@/entities/gauge'
import { formDefaultOptions } from '@/shared/model/form'
import { BlockSkeleton } from '@/shared/ui/skeleton'
import { FormContainer, FormFieldsContainer, GroupedFieldsContainer } from '@/shared/ui/styled-containers'

export const DepositReward: React.FC<{
  chainId: ChainId
  poolId: string
}> = ({ chainId, poolId }) => {
  const { isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
  })

  const methods = useForm<DepositRewardFormValues>({
    ...formDefaultOptions,
    resolver: vestResolver(depositRewardValidationSuite),
    defaultValues: DepositRewardDefaultValues,
  })

  if (isPendingRewardDistributors) {
    return <BlockSkeleton height={440} />
  }

  return (
    <FormProvider {...methods}>
      <form>
        <FormContainer>
          <FormFieldsContainer>
            <AmountTokenInput chainId={chainId} poolId={poolId} />
            <FormErrorsDisplay errorKeys={['rewardTokenId', 'amount']} component={AlertFormError} />
            <EpochInput chainId={chainId} poolId={poolId} />
            <FormErrorsDisplay errorKeys={['epoch']} component={AlertFormError} />
            <GroupedFieldsContainer>
              <HelperFields chainId={chainId} poolId={poolId} />
              <GasEstimation chainId={chainId} poolId={poolId} />
            </GroupedFieldsContainer>
          </FormFieldsContainer>
          <DepositStepper chainId={chainId} poolId={poolId} />
          <FormErrorsDisplay errorKeys={['root.serverError']} component={AlertFormError} />
        </FormContainer>
      </form>
    </FormProvider>
  )
}
