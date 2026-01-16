import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useHealthQueries } from '@/llamalend/hooks/useHealthQueries'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { type RepayOptions, useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useRepayBands } from '@/llamalend/queries/repay/repay-bands.query'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { getRepayHealthOptions } from '@/llamalend/queries/repay/repay-health.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { useRepayRouteImage } from '@/llamalend/queries/repay/repay-route-image.query'
import type { RepayFromCollateralIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import { type RepayForm, repayFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useFormErrors } from '../../borrow/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<RepayForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useRepayForm = <ChainId extends LlamaChainId>({
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
  onRepaid?: RepayOptions['onRepaid']
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
      isFull: false,
    },
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): RepayFromCollateralIsFullParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        stateCollateral: values.stateCollateral,
        userCollateral: values.userCollateral,
        userBorrowed: values.userBorrowed,
        isFull: values.isFull,
      }),
      [
        chainId,
        marketId,
        userAddress,
        values.stateCollateral,
        values.userCollateral,
        values.userBorrowed,
        values.isFull,
      ],
    ),
  )

  const { onSubmit, ...action } = useRepayMutation({ network, marketId, onRepaid, onReset: form.reset, userAddress })

  useCallbackAfterFormUpdate(form, action.reset)

  const bands = useRepayBands(params, enabled)
  const expectedBorrowed = useRepayExpectedBorrowed(params, enabled)
  const health = useHealthQueries((isFull) => getRepayHealthOptions({ ...params, isFull }, enabled))
  const isAvailable = useRepayIsAvailable(params, enabled)
  const isFull = useRepayIsFull(params, enabled)
  const priceImpact = useRepayPriceImpact(params, enabled)
  const prices = useRepayPrices(params, enabled)
  const routeImage = useRepayRouteImage(params, enabled)
  const gas = useRepayEstimateGas(networks, params, enabled)

  const formErrors = useFormErrors(form.formState)

  useEffect(() => form.setValue('isFull', isFull.data, { shouldValidate: true }), [form, isFull.data])

  return {
    form,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    bands,
    expectedBorrowed,
    health,
    isDisabled: !isAvailable.data || formErrors.length > 0,
    isFull,
    priceImpact,
    prices,
    routeImage,
    gas,
    txHash: action.data?.hash,
    collateralToken,
    borrowToken,
    formErrors,
  }
}
