import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens, hasLeverage } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { type RepayOptions, useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useBorrowCreateLoanIsApproved } from '@/llamalend/queries/create-loan/borrow-create-loan-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import { type RepayForm, repayFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { setValueOptions, useFormErrors } from '../../borrow/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<RepayForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useRepayForm = <ChainId extends LlamaChainId, NetworkName extends LlamaNetworkId = LlamaNetworkId>({
  market,
  network,
  networks,
  enabled,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  networks: NetworkDict<ChainId>
  enabled?: boolean
  onRepaid?: NonNullable<RepayOptions['onRepaid']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken

  const form = useForm<RepayForm>({
    ...formDefaultOptions,
    resolver: vestResolver(repayFormValidationSuite),
    defaultValues: {
      stateCollateral: undefined,
      userCollateral: undefined,
      userBorrowed: undefined,
      isFull: undefined,
      slippage: SLIPPAGE_PRESETS.STABLE,
      withdrawEnabled: false,
      leverageEnabled: false,
    },
  })

  const values = form.watch()

  const params = useDebouncedValue(
    useMemo(
      (): RepayIsFullParams<ChainId> => ({ chainId, marketId, userAddress, ...values }),
      [chainId, marketId, userAddress, values],
    ),
  )

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

  const isAvailable = useRepayIsAvailable(params, enabled)
  const isFull = useRepayIsFull(params, enabled)

  const formErrors = useFormErrors(form.formState)

  useEffect(() => form.setValue('isFull', isFull.data, setValueOptions), [form, isFull.data])

  // todo: remove from form, move this to queries directly as they depend on market only
  useEffect(() => market && form.setValue('leverageEnabled', hasLeverage(market), setValueOptions), [market, form])

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isRepaying,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !isAvailable.data || formErrors.length > 0,
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash: data?.hash,
    isApproved: useBorrowCreateLoanIsApproved(params),
    formErrors: useFormErrors(form.formState),
    isFull,
  }
}
