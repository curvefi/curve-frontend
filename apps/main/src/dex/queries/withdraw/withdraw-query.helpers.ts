import type { WithdrawMutation } from '@/dex/features/withdraw/types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'

type WithdrawFields = Pick<WithdrawMutation, 'mode' | 'lpAmount' | 'tokenIndex' | 'amounts'>

export function getWithdrawImplementation(
  poolOrAddress: PoolTemplate | string,
  { mode, amounts, tokenIndex, lpAmount }: WithdrawFields,
) {
  const pool = typeof poolOrAddress === 'string' ? requireLib('curveApi').getPool(poolOrAddress) : poolOrAddress
  return mode === 'balanced'
    ? (['balanced', pool, [lpAmount!]] as const)
    : mode === 'unbalanced'
      ? (['imbalance', pool, [amounts]] as const)
      : (['oneCoin', pool, [lpAmount!, tokenIndex!]] as const)
}
