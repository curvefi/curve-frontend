import { getLlamaMarket, hasResetPosition } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { Decimal } from '@primitives/decimal.utils'
import { decimalSum } from '@ui-kit/utils'

export const getResetImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  if (!hasResetPosition(market)) throw new Error('Reset position is only available for Llamalend v2 lend markets')
  return market.loan
}

/** The total amount of debt the loan gets reduced by is whatever collateral has been converted + whatever the user's entered (with a minimum of `tokensToShrink`) */
export const getResetDebtReduction = ({
  convertedBorrowed,
  userBorrowed,
}: {
  convertedBorrowed?: Decimal | null
  userBorrowed?: Decimal | null
}) => decimalSum(convertedBorrowed ?? '0', userBorrowed ?? '0')
