import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import { getTokens } from '@/llamalend/llama.utils'
import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import type { RepayForm } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { mapQuery, Query } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'

const useQueryMinimum = (...data: Query<Decimal>[]) => ({
  data: data.some((d) => d.data == null) ? undefined : decimal(Math.min(...data.map((d) => +d.data!))),
  isLoading: data.some((d) => d?.isLoading),
  error: data.map((d) => d?.error).find(Boolean),
})

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
  const isFull = useRepayIsFull(params, enabled)

  const maxBorrowed = useQueryMinimum(
    maxUserBorrowed,
    mapQuery(userState, (d) => d.debt),
  )

  useEffect(
    () => form.setValue('maxCollateral', maxUserCollateral.data, setValueOptions),
    [form, maxUserCollateral.data],
  )
  useEffect(() => form.setValue('maxBorrowed', maxBorrowed.data, setValueOptions), [form, maxBorrowed.data])
  useEffect(() => form.setValue('isFull', isFull.data, setValueOptions), [form, isFull.data])
  useEffect(
    () => form.setValue('maxStateCollateral', userState.data?.collateral, setValueOptions),
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
