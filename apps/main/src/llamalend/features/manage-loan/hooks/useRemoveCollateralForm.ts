import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  type RemoveCollateralOptions,
  useRemoveCollateralMutation,
} from '@/llamalend/mutations/remove-collateral.mutation'
import { useMaxRemovableCollateral } from '@/llamalend/queries/remove-collateral/remove-collateral-max-removable.query'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  type CollateralForm,
  removeCollateralFormValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

export const useRemoveCollateralForm = <
  ChainId extends LlamaChainId,
  NetworkName extends LlamaNetworkId = LlamaNetworkId,
>({
  market,
  network,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkName, ChainId>
  enabled?: boolean
  onSuccess?: NonNullable<RemoveCollateralOptions['onSuccess']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken

  const form = useForm<CollateralForm>({
    ...formDefaultOptions,
    resolver: vestResolver(removeCollateralFormValidationSuite),
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
        maxCollateral: values.maxCollateral,
        userCollateral: values.userCollateral,
      }),
      [chainId, marketId, userAddress, values.userCollateral, values.maxCollateral],
    ),
  )

  const { onSubmit, ...action } = useRemoveCollateralMutation({
    marketId,
    network,
    onSuccess,
    onReset: form.reset,
    userAddress,
  })
  const { formState } = form
  const maxRemovable = useMaxRemovableCollateral(params, enabled)

  useCallbackAfterFormUpdate(form, action.reset)

  useEffect(() => {
    updateForm(form, { maxCollateral: maxRemovable.data })
  }, [form, maxRemovable.data])

  const isPending = formState.isSubmitting || action.isPending
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    maxRemovable,
    collateralToken,
    borrowToken,
    txHash: action.data?.hash,
    formErrors: useFormErrors(formState),
  }
}
