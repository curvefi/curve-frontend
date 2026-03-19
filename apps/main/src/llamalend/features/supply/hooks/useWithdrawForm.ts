import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type WithdrawOptions, useWithdrawMutation } from '@/llamalend/mutations/withdraw.mutation'
import { useUserBalances } from '@/llamalend/queries/user'
import {
  type WithdrawMutation,
  withdrawFormValidationSuite,
  WithdrawParams,
  type WithdrawForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { Decimal } from '@primitives/decimal.utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyWithdrawForm = (): WithdrawForm => ({
  withdrawAmount: undefined,
  maxWithdrawAmount: undefined,
  isFull: false,
})

const getIsWithdrawFull = (withdrawAmount: Decimal | undefined, maxUserWithdrawAmount: Decimal | undefined) =>
  withdrawAmount && maxUserWithdrawAmount && new BigNumber(withdrawAmount).gte(new BigNumber(maxUserWithdrawAmount))

export const useWithdrawForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onSuccess?: NonNullable<WithdrawOptions['onSuccess']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const userBalances = useUserBalances({ chainId, marketId, userAddress }, enabled)
  const maxUserWithdrawAmount = mapQuery(userBalances, (d) => d.vaultSharesConverted)

  const form = useForm<WithdrawForm>({
    ...formDefaultOptions,
    resolver: vestResolver(withdrawFormValidationSuite),
    defaultValues: emptyWithdrawForm(),
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): WithdrawParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        withdrawAmount: values.withdrawAmount,
        isFull: values.isFull,
        userVaultShares: userBalances.data?.vaultShares,
      }),
      [chainId, marketId, userAddress, userBalances.data?.vaultShares, values.isFull, values.withdrawAmount],
    ),
  )

  const isFull = getIsWithdrawFull(params.withdrawAmount ?? undefined, maxUserWithdrawAmount.data)

  const {
    onSubmit,
    isPending: isWithdrawing,
    isSuccess: isWithdrawn,
    error: withdrawError,
    data,
    reset: resetWithdraw,
  } = useWithdrawMutation({ marketId, network, onSuccess, onReset: form.reset, userAddress })

  const { formState } = form

  useCallbackAfterFormUpdate(form, resetWithdraw)

  useEffect(() => {
    updateForm(form, {
      maxWithdrawAmount: maxUserWithdrawAmount.data,
      isFull,
    })
  }, [form, maxUserWithdrawAmount.data, isFull])

  const isPending = formState.isSubmitting || isWithdrawing

  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(async ({ withdrawAmount = '0', isFull = false }: WithdrawForm) => {
      await onSubmit({
        withdrawAmount,
        isFull,
        userVaultShares: userBalances.data?.vaultShares ?? '0',
      } as WithdrawMutation)
    }),
    isDisabled: !formState.isValid || isPending,
    borrowToken,
    isWithdrawn,
    withdrawError,
    txHash: data?.hash,
    max: maxUserWithdrawAmount,
    formErrors: useFormErrors(formState),
  }
}
