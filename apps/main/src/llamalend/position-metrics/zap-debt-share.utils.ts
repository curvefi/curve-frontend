import { BigNumber } from 'bignumber.js'
import type { UserCollateralEvents as MintCollateralEvents } from '@curvefi/prices-api/crvusd'
import type { UserCollateralEvents as LendCollateralEvents } from '@curvefi/prices-api/lending'
import type { Decimal } from '@primitives/decimal.utils'
import { ZERO, decimal } from '@ui/lib/decimal'

const share = (part: BigNumber, total: BigNumber): Decimal =>
  total.gt(0) ? (decimal(BigNumber.min(BigNumber.max(part.div(total), 0), 1).toFixed()) ?? ZERO) : ZERO

/**
 * Lending events are oldest first with a signed `loanChange`. A Borrow carries a `leverage` object only when it went
 * through the zap. The running debt reaching zero closes the position, so only the open position's borrows count.
 */
export const lendZapDebtShare = ({ events }: LendCollateralEvents): Decimal => {
  let zap = BigNumber(0)
  let all = BigNumber(0)
  let running = BigNumber(0)
  for (const { type, loanChange, leverage } of events) {
    running = running.plus(loanChange)
    if (running.lte(0)) {
      zap = BigNumber(0)
      all = BigNumber(0)
      running = BigNumber(0)
      continue
    }
    if (type === 'Borrow' && loanChange > 0) {
      all = all.plus(loanChange)
      if (leverage) zap = zap.plus(loanChange)
    }
  }
  return share(zap, all)
}

/**
 * Mint events carry no zap details. Collateral the zap bought with debt is valued at deposit time, and crvUSD debt is
 * close to USD, so that value over the total borrowed approximates the share.
 */
export const mintZapDebtShare = ({
  totalDepositUsdValue,
  totalDepositFromUserUsdValue,
  totalBorrowed,
}: MintCollateralEvents): Decimal =>
  share(BigNumber(totalDepositUsdValue).minus(totalDepositFromUserUsdValue), BigNumber(totalBorrowed))
