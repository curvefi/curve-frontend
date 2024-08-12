import { TIME_FRAMES } from '@/constants'
import { useGaugeRewardsDistributors } from '@/entities/gauge'
import { schema } from '@/features/deposit-gauge-reward/model/form-schema'
import { DepositRewardFormValues, DepositRewardStep } from '@/features/deposit-gauge-reward/types'
import {
  AmountTokenInput,
  DepositStepper,
  EpochInput,
  GasEstimation,
  HelperFields,
} from '@/features/deposit-gauge-reward/ui'
import { formDefaultOptions } from '@/shared/model/form'
import { FormErrorsDisplay } from '@/shared/ui/forms'
import { BlockSkeleton } from '@/shared/ui/skeleton'
import { FormContainer, FormFieldsContainer, GroupedFieldsContainer } from '@/shared/ui/styled-containers'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { zeroAddress } from 'viem'

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
    resolver: zodResolver(schema),
    defaultValues: {
      rewardTokenId: zeroAddress,
      amount: '',
      epoch: 1 * TIME_FRAMES.WEEK,
      step: DepositRewardStep.APPROVAL,
    },
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
            <FormErrorsDisplay errorKeys={['rewardTokenId', 'amount']} />
            <EpochInput chainId={chainId} poolId={poolId} />
            <FormErrorsDisplay errorKeys={['epoch']} />
            <GroupedFieldsContainer>
              <HelperFields chainId={chainId} poolId={poolId} />
              <GasEstimation chainId={chainId} poolId={poolId} />
            </GroupedFieldsContainer>
          </FormFieldsContainer>
          <DepositStepper chainId={chainId} poolId={poolId} />
          <FormErrorsDisplay errorKeys={['root.serverError']} />
        </FormContainer>
      </form>
    </FormProvider>
  )
}