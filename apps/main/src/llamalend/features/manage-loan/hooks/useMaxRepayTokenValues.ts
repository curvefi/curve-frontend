import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { getTokens } from '@/llamalend/llama.utils'
import { useRepayExpectedBorrowed } from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useQueryMinimum } from '@ui-kit/lib'
import { mapQuery } from '@ui-kit/types/util'
import { updateForm } from '@ui-kit/utils/react-form.utils'

export function useMaxRepayTokenValues<ChainId extends LlamaChainId>(
  {
    collateralToken,
    borrowToken,
    params,
    form,
  }: Partial<ReturnType<typeof getTokens>> & {
    params: RepayIsFullParams<ChainId>
    form: UseFormReturn<RepayForm>
  },
  enabled?: boolean,
) {
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
  useRepayExpectedBorrowed(params) // required for isFull query
  const isFull = useRepayIsFull(params, enabled)

  const maxBorrowed = useQueryMinimum(
    maxUserBorrowed,
    mapQuery(userState, (d) => d.debt),
  )

  useEffect(() => updateForm(form, { maxCollateral: maxUserCollateral.data }), [form, maxUserCollateral.data])
  useEffect(() => updateForm(form, { maxBorrowed: maxBorrowed.data }), [form, maxBorrowed.data])
  useEffect(() => (isFull.data == null ? undefined : updateForm(form, { isFull: isFull.data })), [form, isFull.data])
  useEffect(
    () => updateForm(form, { maxStateCollateral: userState.data?.collateral }),
    [form, userState.data?.collateral],
  )

  return {
    isFull,
    max: {
      userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
      userBorrowed: { ...maxBorrowed, field: 'maxBorrowed' as const },
      stateCollateral: { ...mapQuery(userState, (d) => d.collateral), field: 'maxStateCollateral' as const },
    },
  }
}
