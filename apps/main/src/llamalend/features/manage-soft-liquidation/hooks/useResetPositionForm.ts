import { useMemo } from 'react'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useResetMutation } from '@/llamalend/mutations/reset.mutation'
import { useResetIsApproved } from '@/llamalend/queries/reset/reset-is-approved.query'
import { useResetIsAvailable } from '@/llamalend/queries/reset/reset-is-available.query'
import { useTokensToShrink } from '@/llamalend/queries/reset/tokens-to-shrink.query'
import { useUserState } from '@/llamalend/queries/user'
import {
  type ResetForm,
  type ResetParams,
  resetFormValidationSuite,
} from '@/llamalend/queries/validation/reset.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useMarketContext } from '../../market-context'

const userDefaultValues = {
  convertedBorrowed: undefined,
  userBorrowed: undefined,
} satisfies Partial<ResetForm>

const defaultValues = {
  ...userDefaultValues,
  maxBorrowed: undefined,
  maxTotalBorrowed: undefined,
  minBorrowed: undefined,
  resetAvailable: undefined,
}

const useResetParams = <ChainId extends LlamaChainId>({
  chainId,
  marketId,
  userAddress,
  convertedBorrowed,
  userBorrowed,
  maxBorrowed,
  maxTotalBorrowed,
  minBorrowed,
  resetAvailable,
}: ResetForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
}) =>
  useFormDebounce(
    useMemo(
      (): ResetParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        convertedBorrowed,
        userBorrowed,
        maxBorrowed,
        maxTotalBorrowed,
        minBorrowed,
        resetAvailable,
      }),
      [
        chainId,
        marketId,
        userAddress,
        convertedBorrowed,
        userBorrowed,
        maxBorrowed,
        maxTotalBorrowed,
        minBorrowed,
        resetAvailable,
      ],
    ),
  )

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

  const form = useForm<ResetForm>({
    defaultValues,
    validation: useMemo(() => resetFormValidationSuite(market), [market]),
  })
  const values = form.watchValues()
  const [params, isDebouncing] = useResetParams({ chainId, marketId, userAddress, ...values })

  const userState = useUserState({ chainId, marketId, userAddress })
  const walletBorrowed = useTokenBalance({ chainId, userAddress, tokenAddress: borrowToken?.address })
  const resetAvailable = useResetIsAvailable({ chainId, marketId, userAddress })
  const tokensToShrink = useTokensToShrink({ chainId, marketId, userAddress })

  useFormSync(form, { convertedBorrowed: userState.data?.stablecoin })
  useFormSync(form, { maxBorrowed: walletBorrowed.data })
  useFormSync(form, { maxTotalBorrowed: userState.data?.debt })
  useFormSync(form, { minBorrowed: tokensToShrink.data })
  useFormSync(form, { resetAvailable: resetAvailable.data })

  const {
    onSubmit,
    isPending: isResetting,
    error,
  } = useResetMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const { formState } = form
  const isPending = formState.isSubmitting || isResetting

  return {
    form,
    values,
    params,
    isPending,
    isLoading: !market || resetAvailable.isLoading,
    isDisabled: !userAddress || !resetAvailable.data || !formState.isValid || isPending || isDebouncing,
    onSubmit: form.handleSubmit(onSubmit),
    error,
    formErrors: formState.visibleErrors,
    borrowToken,
    collateralToken,
    isApproved: useResetIsApproved(params),
    requiredWalletAmount: maybe(params.minBorrowed, x => (+x > 0 ? x : undefined)),
  }
}
