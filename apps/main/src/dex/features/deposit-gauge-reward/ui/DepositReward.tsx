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
import { updateForm } from '@ui-kit/utils/react-form.utils'

export const DepositReward = ({ chainId, poolId }: { chainId: ChainId; poolId: string }) => {
  const { address: signerAddress } = useConnection()
  const { isPending: isPendingRewardDistributors } = useGaugeRewardsDistributors({
    chainId,
    poolId,
    userAddress: signerAddress,
  })

  const form = useForm<DepositRewardFormValues>({
    ...formDefaultOptions,
    resolver: vestResolver(depositRewardValidationSuite),
    defaultValues: DepositRewardDefaultValues,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const rewardTokenId = form.watch('rewardTokenId')
  const { address: userAddress } = useConnection()
  const { data: userBalance } = useTokenBalance({ chainId, userAddress, tokenAddress: rewardTokenId })

  // Sync userBalance from query into form for validation
  useEffect(() => updateForm(form, { userBalance }), [userBalance, form])

  if (isPendingRewardDistributors) {
    return <BlockSkeleton height={440} />
  }

  return (
    <FormProvider {...form}>
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
