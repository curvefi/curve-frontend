import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { type RepayOptions, useRepayMutation } from '@/llamalend/features/manage-loan/mutations/repay.mutation'
import type { RepayFromCollateralParams } from '@/llamalend/features/manage-loan/queries/manage-loan.types'
import {
  repayFormValidationSuite,
  type RepayForm,
} from '@/llamalend/features/manage-loan/queries/manage-loan.validation'
import { useRepayBands } from '@/llamalend/features/manage-loan/queries/repay/repay-bands.query'
import { useRepayExpectedBorrowed } from '@/llamalend/features/manage-loan/queries/repay/repay-expected-borrowed.query'
import { useRepayEstimateGas } from '@/llamalend/features/manage-loan/queries/repay/repay-gas-estimate.query'
import { useRepayHealth } from '@/llamalend/features/manage-loan/queries/repay/repay-health.query'
import { useRepayIsAvailable } from '@/llamalend/features/manage-loan/queries/repay/repay-is-available.query'
import { useRepayIsFull } from '@/llamalend/features/manage-loan/queries/repay/repay-is-full.query'
import { useRepayPriceImpact } from '@/llamalend/features/manage-loan/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/features/manage-loan/queries/repay/repay-prices.query'
import { useRepayRouteImage } from '@/llamalend/features/manage-loan/queries/repay/repay-route-image.query'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { useFormErrors } from '../../borrow/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<RepayForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useRepayForm = ({
  market,
  network,
  networks,
  enabled = true,
  onRepaid,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  networks: NetworkDict<LlamaChainId>
  enabled?: boolean
  onRepaid?: NonNullable<RepayOptions['onRepaid']>
}) => {
  const { address: userAddress } = useAccount()
  const { chainId } = network
  const marketId = market?.id

  const form = useForm<RepayForm>({
    ...formDefaultOptions,
    resolver: vestResolver(repayFormValidationSuite),
    defaultValues: {
      stateCollateral: undefined,
      userCollateral: undefined,
      userBorrowed: undefined,
    },
  })

  const values = form.watch()

  const params = useDebouncedValue(
    useMemo(
      () =>
        ({
          chainId,
          marketId,
          userAddress,
          stateCollateral: values.stateCollateral,
          userCollateral: values.userCollateral,
          userBorrowed: values.userBorrowed,
        }) as RepayFromCollateralParams<LlamaChainId>,
      [chainId, marketId, userAddress, values.stateCollateral, values.userCollateral, values.userBorrowed],
    ),
  )

  const { onSubmit, ...action } = useRepayMutation({ network, marketId, onRepaid })

  useCallbackAfterFormUpdate(form, action.reset)

  const bands = useRepayBands(params, enabled)
  const expectedBorrowed = useRepayExpectedBorrowed(params, enabled)
  const healthFull = useRepayHealth({ ...params, isFull: true }, enabled)
  const healthNotFull = useRepayHealth({ ...params, isFull: false }, enabled)
  const isAvailable = useRepayIsAvailable(params, enabled)
  const isFull = useRepayIsFull(params, enabled)
  const priceImpact = useRepayPriceImpact(params, enabled)
  const prices = useRepayPrices(params, enabled)
  const routeImage = useRepayRouteImage(params, enabled)
  const gas = useRepayEstimateGas(networks, params, enabled)

  const formErrors = useFormErrors(form.formState)

  return {
    chainId,
    marketId,
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || action.isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    bands,
    expectedBorrowed,
    healthFull,
    healthNotFull,
    isAvailable,
    isFull,
    priceImpact,
    prices,
    routeImage,
    gas,
    formErrors,
  }
}
