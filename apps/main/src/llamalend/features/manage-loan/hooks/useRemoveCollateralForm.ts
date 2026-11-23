import { useRemoveCollateralMutation } from '@/llamalend/mutations/remove-collateral.mutation'
import {
  invalidateMaxRemovableCollateral,
  useMaxRemovableCollateral,
} from '@/llamalend/queries/remove-collateral/remove-collateral-max-removable.query'
import { useRemoveCollateralPrices } from '@/llamalend/queries/remove-collateral/remove-collateral-prices.query'
import { resetUserCurrentLeverage } from '@/llamalend/queries/user/user-current-leverage.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { CollateralCalculatedValues, CollateralFormValues } from '@/llamalend/queries/validation/manage-loan.types'
import { removeCollateralFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { NetworkDef } from '@legacy-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useCallbackSync, useOnChangeCallback } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { mapQuery, type Range } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'

const defaultValues = { userCollateral: undefined }

export const useRemoveCollateralForm = <
  ChainId extends LlamaChainId,
  NetworkName extends LlamaNetworkId = LlamaNetworkId,
>({
  network,
  onPricesUpdated,
}: {
  network: NetworkDef<NetworkName, ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const { market, marketId, tokens, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network

  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken

  const inputs = useFormValues<CollateralFormValues, UserMarketParams<ChainId>>({
    defaultValues,
    context: { chainId, marketId, userAddress },
  })
  const maxRemovable = useMaxRemovableCollateral(inputs.params)

  const { onSubmit, isPending, error } = useRemoveCollateralMutation({
    marketId,
    network,
    onReset: () => inputs.reset(defaultValues),
    userAddress,
  })

  const form = useFormValidation<CollateralFormValues, UserMarketParams<ChainId>, CollateralCalculatedValues>({
    inputs,
    validation: removeCollateralFormValidationSuite,
    computed: { maxCollateral: maxRemovable },
    isSubmitting: isPending,
  })
  const { values, params, formState } = form

  useCallbackSync(useRemoveCollateralPrices(params), onPricesUpdated)

  useOnChangeCallback(market, () =>
    // collateral remove queries depend on LL internal cache, reset when new market data arrives
    Promise.all([resetUserCurrentLeverage(params), invalidateMaxRemovableCollateral(params)]),
  )

  return {
    form,
    values,
    params,
    isPending,
    userAddress,
    onSubmit: form.handleSubmit(onSubmit),
    error: error ?? form.error,
    maxRemovable,
    positionCollateral: mapQuery(useUserState(params), d => d.collateral),
    collateralToken,
    borrowToken,
    formErrors: formState.visibleErrors,
  }
}
