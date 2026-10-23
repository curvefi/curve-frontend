import type { WithdrawMutation } from '@/dex/features/withdraw/types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'

type WithdrawFields = Pick<WithdrawMutation, 'isBalanced' | 'lpAmount' | 'maxLpAmount' | 'maxWithdrawIndex' | 'amounts'>

export function getWithdrawImplementation(
  poolOrAddress: PoolTemplate | string,
  { isBalanced, amounts, maxWithdrawIndex, lpAmount, maxLpAmount }: WithdrawFields,
) {
  const pool = typeof poolOrAddress === 'string' ? requireLib('curveApi').getPool(poolOrAddress) : poolOrAddress
  const index = getSingleCoinWithdrawIndex({ maxWithdrawIndex, lpAmount, maxLpAmount })
  return isBalanced
    ? (['balanced', pool, [lpAmount]] as const)
    : index == null
      ? (['imbalance', pool, [amounts]] as const)
      : (['oneCoin', pool, [lpAmount, index]] as const)
}
