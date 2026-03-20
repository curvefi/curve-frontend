import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type AddCollateralOptions, useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  addCollateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { type Range } from '@ui-kit/types/util'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

function useChartPricesCallback(
  params: CollateralParams,
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void,
  enabled: boolean,
) {
  const { data: pricesData } = useAddCollateralPrices(params, enabled)
  useEffect(() => onPricesUpdated(pricesData), [onPricesUpdated, pricesData])
  useEffect(() => () => onPricesUpdated(undefined), [onPricesUpdated])
}

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  market,
  network,
  onSuccess,
  onPricesUpdated,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  onSuccess?: NonNullable<AddCollateralOptions['onSuccess']>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  enabled: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken
  const maxCollateral = useTokenBalance({ chainId, userAddress, tokenAddress: collateralToken?.address })

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(addCollateralFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      maxCollateral: undefined,
    },
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): CollateralParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        userCollateral: values.userCollateral,
        maxCollateral: values.maxCollateral,
      }),
      [chainId, marketId, userAddress, values.userCollateral, values.maxCollateral],
    ),
  )

  const { onSubmit, ...action } = useAddCollateralMutation({
    marketId,
    network,
    onSuccess,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form
  useCallbackAfterFormUpdate(form, action.reset)
  useChartPricesCallback(params, onPricesUpdated, enabled)

  useEffect(() => {
    updateForm(form, { maxCollateral: maxCollateral.data })
  }, [form, maxCollateral.data])

  const isPending = formState.isSubmitting || action.isPending
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    collateralToken,
    borrowToken,
    txHash: action.data?.hash,
    isApproved: useAddCollateralIsApproved(params),
    formErrors: useFormErrors(formState),
    maxCollateral,
  }
}
