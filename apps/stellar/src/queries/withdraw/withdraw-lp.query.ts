import { calculateMaximumBurn } from '@/stellar/lib/amounts'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import type { ExpectedLpParams } from '@/stellar/queries/validation/liquidity.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { getSingleCoinWithdrawIndex } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'

/** Balanced and one-coin withdrawals burn exactly the selected LP; imbalance withdrawals cap the burn. */
export function useWithdrawLp(params: Omit<ExpectedLpParams, 'isDeposit'> & { slippage: Decimal }) {
  const expectedLp = q(useExpectedLp({ ...params, isDeposit: false }))
  const maximumLp = mapQuery(expectedLp, expected =>
    params.isBalanced || getSingleCoinWithdrawIndex(params) != null
      ? expected
      : calculateMaximumBurn(expected, params.slippage),
  )
  return { expectedLp, maximumLp }
}
