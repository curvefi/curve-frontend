import type { WithdrawQuoteParams } from '@/stellar/features/withdraw/types'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { q } from '@ui/features/queries/util'

export const useWithdrawExpectedLp = (params: WithdrawQuoteParams) =>
  q(
    useExpectedLp({
      ...params,
      isDeposit: false,
      isBalanced: params.mode === 'balanced',
      isExactBurn: params.mode !== 'unbalanced',
    }),
  )
