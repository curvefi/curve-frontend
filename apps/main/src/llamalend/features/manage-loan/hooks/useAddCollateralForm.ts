import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import { resetUserCurrentLeverage } from '@/llamalend/queries/user/user-current-leverage.query'
import type { CollateralCalculatedValues, CollateralFormValues } from '@/llamalend/queries/validation/manage-loan.types'
import { addCollateralFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { Decimal } from '@primitives/decimal.utils'
import { useCallbackSync, useOnChangeCallback } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { q, type Range } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'

const defaultValues = { userCollateral: undefined }

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  network,
  onPricesUpdated,
}: {
  network: LlamaNetwork<ChainId>
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
  const maxCollateral = useTokenBalance({ ...inputs.params, tokenAddress: collateralToken?.address })

  const { onSubmit, isPending, error } = useAddCollateralMutation({
    marketId,
    network,
    onReset: () => inputs.reset(defaultValues),
    userAddress,
  })

  const form = useFormValidation<CollateralFormValues, UserMarketParams<ChainId>, CollateralCalculatedValues>({
    inputs,
    validation: addCollateralFormValidationSuite,
    computed: { maxCollateral },
    isSubmitting: isPending,
  })
  const { values, params, formState } = form

  useCallbackSync(useAddCollateralPrices(params), onPricesUpdated)

  // `addCollateralFutureLeverage` depends on LL internal cache for currentLeverage, reset when new market data arrives
  useOnChangeCallback(market, () => resetUserCurrentLeverage(params))

  return {
    form,
    values,
    params,
    isPending,
    userAddress,
    onSubmit: form.handleSubmit(onSubmit),
    error: error ?? form.error,
    collateralToken,
    borrowToken,
    isApproved: q(useAddCollateralIsApproved(params)),
    formErrors: formState.visibleErrors,
    maxCollateral,
  }
}
