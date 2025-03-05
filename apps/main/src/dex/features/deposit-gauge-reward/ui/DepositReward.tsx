import { vestResolver } from '@hookform/resolvers/vest'
import { FormProvider, useForm } from 'react-hook-form'
import { DepositRewardDefaultValues, depositRewardValidationSuite } from '@/dex/features/deposit-gauge-reward/model'
import { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import {
  AmountTokenInput,
  DepositStepper,
  EpochInput,
  GasEstimation,
  HelperFields,
} from '@/dex/features/deposit-gauge-reward/ui'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { formDefaultOptions } from '@ui-kit/lib/model/form'
import { BlockSkeleton } from '@ui/skeleton'
import { FormContainer, FormFieldsContainer, GroupedFieldsContainer } from '@ui/styled-containers'
import AlertFormError from '@/dex/components/AlertFormError'
import { FormErrorsDisplay } from '@ui/FormErrorsDisplay'
import { ChainId } from '@/dex/types/main.types'

export const DepositReward = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
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
              <HelperFields />
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
