import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useAddCollateralMutation } from '@/llamalend/mutations/add-collateral.mutation'
import { useAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { useAddCollateralPrices } from '@/llamalend/queries/add-collateral/add-collateral-prices.query'
import type { CollateralParams } from '@/llamalend/queries/validation/manage-loan.types'
import {
  addCollateralFormValidationSuite,
  type CollateralForm,
} from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { useForm } from '@ui-kit/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import type { Range } from '@ui-kit/types/util'
import { useCallbackSync, useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'

export const useAddCollateralForm = <ChainId extends LlamaChainId>({
  market,
  network,
  onPricesUpdated,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  enabled: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const tokens = market && getTokens(market)
  const collateralToken = tokens?.collateralToken
  const borrowToken = tokens?.borrowToken
  const maxCollateral = useTokenBalance({ chainId, userAddress, tokenAddress: collateralToken?.address }, enabled)

  const form = useForm<CollateralForm>({
    validation: addCollateralFormValidationSuite,
    defaultValues: {
      userCollateral: undefined,
      maxCollateral: undefined,
    },
  })

  const values = form.values

  const [params, isDebouncing] = useFormDebounce(
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
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form
  useCallbackSync(useAddCollateralPrices(params, enabled), onPricesUpdated)

  useFormSync(form, { maxCollateral: maxCollateral.data })

  const isPending = formState.isSubmitting || action.isPending
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending || isDebouncing,
    onSubmit: form.handleSubmit(onSubmit),
    action,
    collateralToken,
    borrowToken,
    isApproved: useAddCollateralIsApproved(params),
    formErrors: useFormErrors(formState),
    maxCollateral,
  }
}
