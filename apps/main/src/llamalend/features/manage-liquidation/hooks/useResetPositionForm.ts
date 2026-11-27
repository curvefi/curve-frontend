import { useMemo } from 'react'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useResetMutation } from '@/llamalend/mutations/reset.mutation'
import { useResetIsApproved } from '@/llamalend/queries/reset/reset-is-approved.query'
import { useResetIsAvailable } from '@/llamalend/queries/reset/reset-is-available.query'
import { useTokensToShrink } from '@/llamalend/queries/reset/tokens-to-shrink.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import { type ResetFormValues, resetFormValidationSuite } from '@/llamalend/queries/validation/reset.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import { maybe } from '@primitives/objects.utils'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { mapQuery, q } from '@ui/features/queries/util'
import { useMarketContext } from '../../market-context'

const defaultValues = { userBorrowed: undefined } satisfies ResetFormValues

export const useResetPositionForm = <ChainId extends LlamaChainId>({
  networks,
}: {
  networks: NetworkDict<ChainId>
}) => {
  const {
    chainId,
    market,
    marketId,
    tokens: { borrowToken, collateralToken },
    userAddress,
  } = useMarketContext<ChainId>()

  const inputs = useFormValues<ResetFormValues, UserMarketParams<ChainId>>({
    defaultValues,
    context: { chainId, marketId, userAddress },
  })

  const userState = useUserState(inputs.params)
  const walletBorrowed = useTokenBalance({ chainId, userAddress, tokenAddress: borrowToken?.address })
  const resetAvailable = useResetIsAvailable(inputs.params)
  const tokensToShrink = useTokensToShrink(inputs.params)

  const { onSubmit, isPending, error } = useResetMutation({
    network: networks[chainId],
    marketId,
    onReset: () => inputs.reset(defaultValues),
    userAddress,
  })

  const form = useFormValidation({
    inputs,
    validation: useMemo(() => resetFormValidationSuite(market), [market]),
    computed: {
      convertedBorrowed: mapQuery(userState, state => state.convertedBorrowed),
      maxBorrowed: walletBorrowed,
      maxTotalBorrowed: mapQuery(userState, state => state.debt),
      minBorrowed: tokensToShrink,
      resetAvailable,
    },
    isSubmitting: isPending,
    disabled: !userAddress || !resetAvailable.data,
  })
  const { values, params, formState } = form

  return {
    form,
    values,
    params,
    isPending,
    isLoading: !market || form.isLoading,
    isDisabled: form.isDisabled,
    userAddress,
    onSubmit: form.handleSubmit(onSubmit),
    error: error ?? form.error,
    formErrors: formState.visibleErrors,
    borrowToken,
    collateralToken,
    isApproved: q(useResetIsApproved(params)),
    requiredWalletAmount: maybe(params.minBorrowed, x => (+x > 0 ? x : undefined)),
  }
}
