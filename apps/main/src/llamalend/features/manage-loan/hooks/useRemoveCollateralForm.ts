import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useRemoveCollateralMutation } from '@/llamalend/mutations/remove-collateral.mutation'
import { useMaxRemovableCollateral } from '@/llamalend/queries/remove-collateral/remove-collateral-max-removable.query'
import { useRemoveCollateralPrices } from '@/llamalend/queries/remove-collateral/remove-collateral-prices.query'
import { useUserState } from '@/llamalend/queries/user'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  type CollateralForm,
  removeCollateralFormValidationSuite,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import type { BaseConfig } from '@ui/utils'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery, type Range } from '@ui-kit/types/util'
import { useCallbackSync, useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'

export const useRemoveCollateralForm = <
  ChainId extends LlamaChainId,
  NetworkName extends LlamaNetworkId = LlamaNetworkId,
>({
  market,
  network,
  enabled,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<NetworkName, ChainId>
  enabled: boolean
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
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

  const [params, isDebouncing] = useFormDebounce(
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
    onReset: form.reset,
    userAddress,
  })
  const { formState } = form
  const maxRemovable = useMaxRemovableCollateral(params, enabled)

  useCallbackSync(useRemoveCollateralPrices(params, enabled), onPricesUpdated)

  useFormSync(form, { maxCollateral: maxRemovable.data })

  const isPending = formState.isSubmitting || action.isPending
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending || isDebouncing,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    maxRemovable,
    positionCollateral: mapQuery(useUserState(params, enabled), (d) => d.collateral),
    collateralToken,
    borrowToken,
    formErrors: useFormErrors(formState),
  }
}
