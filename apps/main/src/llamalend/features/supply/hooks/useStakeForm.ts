import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { getTokens, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type StakeOptions, useStakeMutation } from '@/llamalend/mutations/stake.mutation'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import { stakeFormValidationSuite, StakeParams, type StakeForm } from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { setValueOptions, useFormErrors } from '@ui-kit/utils/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<StakeForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const emptyStakeForm = (): StakeForm => ({
  stakeAmount: undefined,
  maxStakeAmount: undefined,
})

const getVaultToken = (market: LlamaMarketTemplate | undefined): { address: Address; symbol: string } | undefined =>
  market && hasVault(market)
    ? {
        address: market.addresses.vault as Address,
        symbol: t`Vault shares`,
      }
    : undefined

export const useStakeForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onStaked,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onStaked?: NonNullable<StakeOptions['onStaked']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const vaultToken = getVaultToken(market)
  const { borrowToken } = market ? getTokens(market) : {}

  const userBalances = useUserBalances({ chainId, marketId, userAddress })
  const maxUserStake = mapQuery(userBalances, (d) => d.vaultShares)

  const form = useForm<StakeForm>({
    ...formDefaultOptions,
    resolver: vestResolver(stakeFormValidationSuite),
    defaultValues: emptyStakeForm(),
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): StakeParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        stakeAmount: values.stakeAmount,
      }),
      [chainId, marketId, userAddress, values.stakeAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isStaking,
    isSuccess: isStaked,
    error: stakeError,
    data,
    reset: resetStake,
  } = useStakeMutation({
    marketId,
    network,
    onStaked,
    onReset: form.reset,
    userAddress,
  })

  const formErrors = useFormErrors(form.formState)

  useCallbackAfterFormUpdate(form, resetStake)

  useEffect(() => {
    form.setValue('maxStakeAmount', maxUserStake.data, setValueOptions)
  }, [form, maxUserStake.data])

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isStaking,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: formErrors.length > 0,
    vaultToken,
    borrowToken,
    isStaked,
    stakeError,
    txHash: data?.hash,
    max: maxUserStake,
    isApproved: useStakeIsApproved(params, enabled),
    formErrors,
  }
}
