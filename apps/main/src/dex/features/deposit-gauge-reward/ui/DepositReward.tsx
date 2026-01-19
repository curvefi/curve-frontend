import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { useGaugeRewardsDistributors } from '@/dex/entities/gauge'
import { DepositRewardDefaultValues, depositRewardValidationSuite } from '@/dex/features/deposit-gauge-reward/model'
import { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import {
  AmountTokenInput,
  DepositStepper,
  EpochInput,
  GasEstimation,
  HelperFields,
} from '@/dex/features/deposit-gauge-reward/ui'
import { ChainId } from '@/dex/types/main.types'
import { vestResolver } from '@hookform/resolvers/vest'
import { FormErrorsDisplay } from '@ui/FormErrorsDisplay'
import { BlockSkeleton } from '@ui/skeleton'
import { FormContainer, FormFieldsContainer, GroupedFieldsContainer } from '@ui/styled-containers'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions } from '@ui-kit/lib/model/form'

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const rewardTokenId = methods.watch('rewardTokenId')
  const { address: userAddress } = useConnection()
  const { data: userBalance } = useTokenBalance({ chainId, userAddress, tokenAddress: rewardTokenId })

  // Sync userBalance from query into form for validation
  useEffect(() => {
    methods.setValue('userBalance', userBalance, { shouldValidate: true })
  }, [userBalance, methods])

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
