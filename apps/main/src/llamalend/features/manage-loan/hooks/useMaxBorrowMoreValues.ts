import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { getTokens } from '@/llamalend/llama.utils'
import { useBorrowMoreMaxReceive } from '@/llamalend/queries/borrow-more/borrow-more-max-receive.query'
import { BorrowMoreForm, BorrowMoreParams } from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'

export function useMaxBorrowMoreValues<ChainId extends LlamaChainId>(
  {
    collateralToken,
    borrowToken,
    params,
    form,
  }: Partial<ReturnType<typeof getTokens>> & {
    params: BorrowMoreParams<ChainId>
    form: UseFormReturn<BorrowMoreForm>
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

  const maxReceive = useBorrowMoreMaxReceive(params, enabled)
  const maxDebt = maxReceive.data?.maxDebt
  const maxBorrowed = maxUserBorrowed.data

  useEffect(
    () => form.setValue('maxCollateral', maxUserCollateral.data, setValueOptions),
    [form, maxUserCollateral.data],
  )
  useEffect(() => form.setValue('maxBorrowed', maxBorrowed, setValueOptions), [form, maxBorrowed])
  useEffect(() => form.setValue('maxDebt', maxDebt, setValueOptions), [form, maxDebt])

  return {
    userCollateral: { ...maxUserCollateral, field: 'maxCollateral' as const },
    userBorrowed: { ...maxUserBorrowed, field: 'maxBorrowed' as const },
    debt: { ...mapQuery(maxReceive, (d) => decimal(d.maxDebt)), field: 'maxDebt' as const },
  }
}
