import { useEffect } from 'react'
import { getTokens } from '@/llamalend/llama.utils'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import { useUserState } from '@/llamalend/queries/user'
import type { RepayFormData, RepayParams } from '@/llamalend/queries/validation/repay.types'
import { maybe } from '@primitives/objects.utils'
import { useFormSync } from '@ui-kit/features/forms'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useQueryMinimum } from '@ui-kit/lib'
import { mapQuery } from '@ui-kit/types/util'

export function useMaxRepayTokenValues(
  {
    collateralToken,
    borrowToken,
    params,
    form,
  }: Partial<ReturnType<typeof getTokens>> & {
    params: RepayParams
    form: UseFormReturn<RepayFormData>
  },
  enabled?: boolean,
) {
  const { update: updateForm } = form
  const { chainId, userAddress } = params
  const maxUserCollateral = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: collateralToken?.address,
  })
  const maxUserBorrowed = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowToken?.address,
  })
  const userState = useUserState(params, enabled)
  // required for isFull query
  const isFull = useRepayIsFull(params, enabled)

  const maxBorrowed = useQueryMinimum(
    maxUserBorrowed,
    mapQuery(userState, d => d.debt),
  )

  useFormSync(form, { maxCollateral: maxUserCollateral.data })
  useFormSync(form, { maxBorrowed: maxBorrowed.data })
  useEffect(
    () => maybe(isFull.data, data => updateForm({ isFull: data }, { automated: true })),
    [isFull.data, updateForm],
  )
  useFormSync(form, { maxStateCollateral: userState.data?.collateral })

  return {
    isFull,
    max: {
      userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
      userBorrowed: { ...maxBorrowed, field: 'maxBorrowed' as const },
      stateCollateral: { ...mapQuery(userState, d => d.collateral), field: 'maxStateCollateral' as const },
      expected: useRepayExpectedBorrowed(params),
    },
  }
}
