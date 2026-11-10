import type { WithdrawQuoteParams } from '@/stellar/features/withdraw/types'
import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { mapQuery, q } from '@ui/features/queries/util'

export function useWithdrawLp(params: WithdrawQuoteParams) {
  const isExactBurn = params.mode !== 'unbalanced'
  const expectedLp = q(
    useExpectedLp({ ...params, isDeposit: false, isBalanced: params.mode === 'balanced', isExactBurn }),
  )
  const maximumLp = mapQuery(expectedLp, expected =>
    isExactBurn ? expected : calculateMaximumBurn(expected, params.slippage),
  )
  return { expectedLp, maximumLp }
}
