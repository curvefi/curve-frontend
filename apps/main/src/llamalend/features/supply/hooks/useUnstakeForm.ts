import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { getTokens, hasVault } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type UnstakeOptions, useUnstakeMutation } from '@/llamalend/mutations/unstake.mutation'
import { useUserBalances } from '@/llamalend/queries/user-balances.query'
import {
  unstakeFormValidationSuite,
  UnstakeParams,
  type UnstakeForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyUnstakeForm = (): UnstakeForm => ({
  unstakeAmount: undefined,
  maxUnstakeAmount: undefined,
})

const getVaultToken = (market: LlamaMarketTemplate | undefined): { address: Address; symbol: string } | undefined =>
  market && hasVault(market)
    ? {
        address: market.addresses.vault as Address,
        symbol: t`Vault shares`,
      }
    : undefined

export const useUnstakeForm = <ChainId extends LlamaChainId>({
  market,
  network,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onSuccess?: NonNullable<UnstakeOptions['onSuccess']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const vaultToken = getVaultToken(market)
  const { borrowToken } = market ? getTokens(market) : {}

  const userBalances = useUserBalances({ chainId, marketId, userAddress })
  const maxUserUnstake = mapQuery(userBalances, (d) => d.gauge)

  const form = useForm<UnstakeForm>({
    ...formDefaultOptions,
    resolver: vestResolver(unstakeFormValidationSuite),
    defaultValues: emptyUnstakeForm(),
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): UnstakeParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        unstakeAmount: values.unstakeAmount,
      }),
      [chainId, marketId, userAddress, values.unstakeAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isUnstaking,
    isSuccess: isUnstaked,
    error: unstakeError,
    data,
    reset: resetUnstake,
  } = useUnstakeMutation({ marketId, network, onSuccess, onReset: form.reset, userAddress })

  const { formState } = form

  useCallbackAfterFormUpdate(form, resetUnstake)

  useEffect(() => {
    updateForm(form, { maxUnstakeAmount: maxUserUnstake.data })
  }, [form, maxUserUnstake.data])

  const isPending = formState.isSubmitting || isUnstaking
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending,
    vaultToken,
    borrowToken,
    isUnstaked,
    unstakeError,
    txHash: data?.hash,
    max: maxUserUnstake,
    formErrors: useFormErrors(formState),
  }
}
