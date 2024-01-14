import { zodResolver } from '@hookform/resolvers/zod'
import { t } from '@lingui/macro'
import React, { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import {
  useAddRewardToken,
  useGaugeRewardsDistributors,
  useIsDepositRewardAvailable,
  type AddRewardTokenParams,
} from '@/entities/gauge'
import networks from '@/networks'
import TxInfoBar from '@/ui/TxInfoBar'
import { schema } from '../model/form-schema'
import type { AddRewardTokenProps, FormValues } from '../types'
import { FlexContainer, StyledBox, Title } from './styled'

import { zeroAddress, type Address } from 'viem'
import { DistributorInput } from './DistributorInput'
import { FormActions } from './FormActions'
import { TokenSelector } from './TokenSelector'

export const AddRewardToken: React.FC<AddRewardTokenProps> = ({ chainId, poolId, walletAddress }) => {
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { isFetching: isFetchingGaugeRewardsDistributors } = useGaugeRewardsDistributors(poolId)

  const { data: isDepositRewardAvailable, isFetching: isFetchingIsDepositRewardAvailable } =
    useIsDepositRewardAvailable(poolId)

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      rewardToken: zeroAddress,
      distributor: (walletAddress as Address) ?? zeroAddress,
    },
  })

  const onAddRewardSuccess = useCallback(
    (resp: string, variables: AddRewardTokenParams) => {
      const txDescription = t`Reward token added`
      setTxInfoBar(<TxInfoBar description={txDescription} txHash={networks[chainId].scanTxPath(resp)} />)
    },
    [chainId]
  )

  const onAddRewardError = useCallback(
    (error: Error) => {
      console.error('error', error)
      methods.setError('root.serverError', { type: 'manual', message: error.message })
    },
    [methods]
  )

  const { mutate: addRewardToken, isPending: isPendingAddRewardToken } = useAddRewardToken(
    poolId,
    onAddRewardSuccess,
    onAddRewardError
  )

  const onSubmit = useCallback(
    (data: FormValues) => {
      addRewardToken({ token: data.rewardToken, distributor: data.distributor })
    },
    [addRewardToken]
  )

  const isFormDisabled = !isDepositRewardAvailable

  const isFormLoading =
    methods.formState.isSubmitting ||
    isFetchingGaugeRewardsDistributors ||
    isFetchingIsDepositRewardAvailable ||
    isPendingAddRewardToken

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <StyledBox>
          <Title>{t`Add Reward Token`}</Title>

          <FlexContainer>
            <TokenSelector chainId={chainId} poolId={poolId} disabled={isFormLoading || isFormDisabled} />
            <DistributorInput disabled={isFormLoading || isFormDisabled} />
          </FlexContainer>

          <FormActions chainId={chainId} poolId={poolId} disabled={isFormDisabled} loading={isFormLoading} />

          {txInfoBar}
        </StyledBox>
      </form>
    </FormProvider>
  )
}
