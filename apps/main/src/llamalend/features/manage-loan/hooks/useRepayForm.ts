import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useMaxRepayTokenValues } from '@/llamalend/features/manage-loan/hooks/useMaxRepayTokenValues'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type RepayOptions, useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import { type RepayForm, repayFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { isEmpty, notFalsy } from '@curvefi/prices-api/objects.util'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { filterFormErrors } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const NOT_AVAILABLE = ['root', t`Repay is not available with the current parameters.`] as const

const useCallbackAfterFormUpdate = (form: UseFormReturn<RepayForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const useRepayParams = <ChainId>({
  isFull,
  maxCollateral,
  slippage,
  stateCollateral,
  userBorrowed,
  userCollateral,
  chainId,
  marketId,
  userAddress,
}: RepayForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
}): RepayIsFullParams<ChainId> =>
  useDebouncedValue(
    useMemo(
      () => ({
        chainId,
        marketId,
        userAddress,
        stateCollateral,
        userCollateral,
        userBorrowed,
        maxCollateral,
        isFull,
        slippage,
      }),
      [chainId, marketId, userAddress, stateCollateral, userCollateral, userBorrowed, maxCollateral, isFull, slippage],
    ),
  )

const emptyRepayForm = () => ({
  stateCollateral: undefined,
  userCollateral: undefined,
  userBorrowed: undefined,
  maxStateCollateral: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  isFull: false,
  slippage: SLIPPAGE_PRESETS.STABLE,
})

export const useRepayForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled?: boolean
  onRepaid?: NonNullable<RepayOptions['onRepaid']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const form = useForm<RepayForm>({
    ...formDefaultOptions,
    resolver: vestResolver(repayFormValidationSuite),
    defaultValues: emptyRepayForm(),
  })

  const values = watchForm(form)
  const params = useRepayParams({ chainId, marketId, userAddress, ...values })

  const {
    onSubmit,
    isPending: isRepaying,
    isSuccess: isRepaid,
    error: repayError,
    data,
    reset: resetRepay,
  } = useRepayMutation({
    network,
    marketId,
    onRepaid,
    onReset: form.reset,
    userAddress,
  })

  useCallbackAfterFormUpdate(form, resetRepay) // reset mutation state on form change

  const { data: isAvailable } = useRepayIsAvailable(params, enabled)
  const { isFull, max } = useMaxRepayTokenValues({ collateralToken, borrowToken, params, form }, enabled)

  const { formState } = form
  return {
    form,
    values,
    params,
    isPending: formState.isSubmitting || isRepaying,
    onSubmit: form.handleSubmit(onSubmit),
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash: data?.hash,
    isApproved: useRepayIsApproved(params, enabled),
    formErrors: useMemo(
      // only show the 'not available' warn when there are no other form errors
      () =>
        isEmpty(formState.errors) ? notFalsy(isAvailable === false && NOT_AVAILABLE) : filterFormErrors(formState),
      [formState, isAvailable],
    ),
    isFull,
    max,
  }
}
