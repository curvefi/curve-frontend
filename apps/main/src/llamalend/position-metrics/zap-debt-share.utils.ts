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

type CashFlowEvent = { loanChange: number; collateralChange: number; oraclePrice: number }

/**
 * Net capital in the open position, valued per event: collateral added minus debt taken out. Debt the zap swaps into
 * collateral cancels against that collateral, so only swap costs remain. Borrows to the wallet count as withdrawals and
 * repays as deposits. Events are oldest first; the running debt reaching zero closes a position.
 */
const sumOpenPosition = (events: readonly CashFlowEvent[], value: (event: CashFlowEvent) => BigNumber): Decimal => {
  let invested = BigNumber(0)
  let running = BigNumber(0)
  for (const event of events) {
    running = running.plus(event.loanChange)
    if (running.lte(0)) {
      invested = BigNumber(0)
      running = BigNumber(0)
      continue
    }
    invested = invested.plus(value(event))
  }
  return decimal(invested.toFixed()) ?? ZERO
}

/** In the debt token, collateral at its oracle price on the day it moved. */
export const netInvested = (events: readonly CashFlowEvent[]): Decimal =>
  sumOpenPosition(events, ({ collateralChange, oraclePrice, loanChange }) =>
    BigNumber(collateralChange).times(oraclePrice).minus(loanChange),
  )

/** In the collateral token, debt converted at the oracle price on the day it moved, like ETH-in vs ETH-out trackers. */
export const netInvestedCollateral = (events: readonly CashFlowEvent[]): Decimal =>
  sumOpenPosition(events, ({ collateralChange, oraclePrice, loanChange }) =>
    oraclePrice > 0 ? BigNumber(collateralChange).minus(BigNumber(loanChange).div(oraclePrice)) : BigNumber(0),
  )

export type PositionHistory = { zapShare: Decimal; netInvested: Decimal; netInvestedCollateral: Decimal }

export const lendPositionHistory = (data: LendCollateralEvents): PositionHistory => ({
  zapShare: lendZapDebtShare(data),
  netInvested: netInvested(data.events),
  netInvestedCollateral: netInvestedCollateral(data.events),
})

export const mintPositionHistory = (data: MintCollateralEvents): PositionHistory => ({
  zapShare: mintZapDebtShare(data),
  netInvested: netInvested(data.events),
  netInvestedCollateral: netInvestedCollateral(data.events),
})
