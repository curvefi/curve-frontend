import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { MarketTokensOrEmpty } from '@/llamalend/llama.utils'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useUnstakeMutation } from '@/llamalend/mutations/unstake.mutation'
import {
  type UnstakeForm,
  unstakeFormValidationSuite,
  UnstakeParams,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useFormSync, useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { mapQuery } from '@ui-kit/types/util'
import { useVaultUserBalances } from './useVaultUserBalances'

const userDefaultValues = { unstakeAmount: undefined }

const emptyUnstakeForm = (): UnstakeForm => ({
  ...userDefaultValues,
  maxUnstakeAmount: undefined,
})

export const useUnstakeForm = <ChainId extends LlamaChainId>({
  marketId,
  tokens,
  network,
}: {
  marketId: string | undefined
  tokens: MarketTokensOrEmpty
  network: LlamaNetwork<ChainId>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network

  const { borrowToken, collateralToken } = tokens

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress })
  const maxUserUnstake = { ...mapQuery(userBalances, d => d.stakedShares), fieldName: 'maxUnstakeAmount' as const }

  const form = useForm<UnstakeForm>({
    validation: unstakeFormValidationSuite,
    defaultValues: emptyUnstakeForm(),
  })

  const values = form.watchValues()

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): UnstakeParams<ChainId> => ({ chainId, marketId, userAddress, unstakeAmount: values.unstakeAmount }),
      [chainId, marketId, userAddress, values.unstakeAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isUnstaking,
    error: unstakeError,
  } = useUnstakeMutation({
    marketId,
    network,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const { formState } = form

  useFormSync(form, { maxUnstakeAmount: maxUserUnstake.data })

  const isPending = formState.isSubmitting || isUnstaking
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing,
    borrowToken,
    collateralToken,
    unstakeError,
    max: maxUserUnstake,
    formErrors: formState.visibleErrors,
  }
}
