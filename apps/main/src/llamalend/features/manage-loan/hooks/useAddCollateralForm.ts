import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type AddCollateralOptions, useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  addCollateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { updateForm, useFormErrors } from '@ui-kit/utils/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CollateralForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  market,
  network,
  onAdded,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  onAdded?: NonNullable<AddCollateralOptions['onAdded']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken
  const { data: maxCollateral } = useTokenBalance({ chainId, userAddress, tokenAddress: collateralToken?.address })

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
    onAdded,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form
  useCallbackAfterFormUpdate(form, action.reset)

  useEffect(() => {
    updateForm(form, { maxCollateral: maxCollateral })
  }, [form, maxCollateral])

  return {
    form,
    values,
    params,
    isPending: formState.isSubmitting || action.isPending,
    isDisabled: !formState.isValid,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    collateralToken,
    borrowToken,
    txHash: action.data?.hash,
    isApproved: useAddCollateralIsApproved(params),
    formErrors: useFormErrors(formState),
  }
}
