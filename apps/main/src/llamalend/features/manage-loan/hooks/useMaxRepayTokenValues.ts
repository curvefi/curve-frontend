import { useRepayIsFull } from '@/llamalend/queries/repay/repay-is-full.query'
import { useUserState } from '@/llamalend/queries/user/user-state.query'
import type { RepayParams } from '@/llamalend/queries/validation/repay.types'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import type { Address } from '@primitives/address.utils'
import { queryMinimum } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'

export function useMaxRepayTokenValues({
  borrowTokenAddress,
  params,
}: {
  borrowTokenAddress: Address | undefined
  params: RepayParams
}) {
  const { chainId, userAddress } = params
  const maxUserBorrowed = useTokenBalance({ chainId, userAddress, tokenAddress: borrowTokenAddress })
  const userState = useUserState(params)
  const isFull = useRepayIsFull(params)

  const maxBorrowed = queryMinimum(
    maxUserBorrowed,
    mapQuery(userState, d => d.debt),
  )

  return {
    isFull,
    max: {
      userBorrowed: { ...q(maxBorrowed), fieldName: 'maxBorrowed' as const },
      stateCollateral: { ...mapQuery(userState, d => d.collateral), fieldName: 'maxStateCollateral' as const },
    },
  }
}
