import { BigNumber } from 'bignumber.js'
import type { UserCollateralEvents as MintCollateralEvents } from '@curvefi/prices-api/crvusd'
import type { UserCollateralEvents as LendCollateralEvents } from '@curvefi/prices-api/lending'
import type { Decimal } from '@primitives/decimal.utils'
import {
  ZERO,
  decimal,
  decimalDiv,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
  decimalSum,
} from '@ui/lib/decimal'

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

/** Events of the open position only. Events are oldest first; the running debt reaching zero closes a position. */
const openPositionEvents = <T extends CashFlowEvent>(events: readonly T[]): T[] => {
  let start = 0
  let running = BigNumber(0)
  events.forEach(({ loanChange }, index) => {
    running = running.plus(loanChange)
    if (running.lte(0)) {
      start = index + 1
      running = BigNumber(0)
    }
  })
  return events.slice(start)
}

const sum = (events: readonly CashFlowEvent[], value: (event: CashFlowEvent) => BigNumber): Decimal =>
  decimal(events.reduce((total, event) => total.plus(value(event)), BigNumber(0)).toFixed()) ?? ZERO

/**
 * Net capital in the open position, in the debt token: collateral added at its oracle price on the day it moved minus
 * debt taken out. Debt the zap swaps into collateral cancels against that collateral, so only swap costs remain. Borrows
 * to the wallet count as withdrawals and repays as deposits.
 */
export const netInvested = (events: readonly CashFlowEvent[]): Decimal =>
  sum(openPositionEvents(events), ({ collateralChange, oraclePrice, loanChange }) =>
    BigNumber(collateralChange).times(oraclePrice).minus(loanChange),
  )

/** Debt converted to the collateral token at the oracle price on the day it moved. */
const debtInCollateral = ({ loanChange, oraclePrice }: CashFlowEvent) =>
  oraclePrice > 0 ? BigNumber(loanChange).div(oraclePrice) : BigNumber(0)

/** Net capital in the collateral token, like ETH-in vs ETH-out trackers. */
export const netInvestedCollateral = (events: readonly CashFlowEvent[]): Decimal =>
  sum(openPositionEvents(events), event => BigNumber(event.collateralChange).minus(debtInCollateral(event)))

/** Debt taken out of the open position, in the collateral token. */
export const borrowedCollateral = (events: readonly CashFlowEvent[]): Decimal =>
  sum(openPositionEvents(events), debtInCollateral)

/**
 * Leverage of the borrow that opened the position, in the same units as the current leverage: collateral value over
 * that value minus the debt looped back into collateral. `loopedShare` is the part of that borrow the zap swapped.
 */
export const openingLeverage = <T extends CashFlowEvent>(
  events: readonly T[],
  loopedShare: (event: T) => BigNumber.Value,
): Decimal | undefined => {
  const [first] = openPositionEvents(events)
  if (!first) return undefined
  const value = BigNumber(first.collateralChange).times(first.oraclePrice)
  const ownCapital = value.minus(BigNumber(first.loanChange).times(loopedShare(first)))
  return value.gt(0) && ownCapital.gt(0) ? decimal(value.div(ownCapital).toFixed()) : undefined
}

export type PositionHistory = {
  zapShare: Decimal
  netInvested: Decimal
  netInvestedCollateral: Decimal
  borrowedCollateral: Decimal
  openingLeverage: Decimal | undefined
}

const positionHistory = <T extends CashFlowEvent>(
  events: readonly T[],
  zapShare: Decimal,
  loopedShare: (event: T) => BigNumber.Value,
): PositionHistory => ({
  zapShare,
  netInvested: netInvested(events),
  netInvestedCollateral: netInvestedCollateral(events),
  borrowedCollateral: borrowedCollateral(events),
  openingLeverage: openingLeverage(events, loopedShare),
})

export const lendPositionHistory = (data: LendCollateralEvents): PositionHistory =>
  positionHistory(data.events, lendZapDebtShare(data), ({ leverage }) => (leverage ? 1 : 0))

/** Mint events carry no zap marker, so the opening borrow uses the position's estimated share. */
export const mintPositionHistory = (data: MintCollateralEvents): PositionHistory => {
  const zapShare = mintZapDebtShare(data)
  return positionHistory(data.events, zapShare, () => zapShare)
}

const percentOf = (part: Decimal | undefined, base: Decimal | undefined) =>
  part != undefined && base != undefined && decimalGreaterThan(base, '0')
    ? decimalMultiply(decimalDiv(part, base), '100')
    : undefined

/**
 * Equity change since opening, net of deposits, withdrawals, wallet borrows and repays, in the collateral token and in
 * the debt token. Each percent is ROE: PnL over own capital, which is net capital plus the debt sent to the wallet, the
 * same base as looped leverage. In the debt token a 1× plain borrow returns the collateral's price move, like a 1× CEX
 * position. The collateral token converts every flow at the oracle price of its day, like ETH-in vs ETH-out trackers.
 */
export const positionPnl = ({
  equity,
  debt,
  oraclePrice,
  history,
}: {
  equity: Decimal
  debt: Decimal
  oraclePrice: Decimal
  history: PositionHistory
}) => {
  const walletShare = decimalMinus('1', history.zapShare)
  const pnl = decimalMinus(equity, history.netInvested)
  const ownCapital = decimalSum(history.netInvested, decimalMultiply(debt, walletShare))
  const pnlCollateral = decimalGreaterThan(oraclePrice, '0')
    ? decimalMinus(decimalDiv(equity, oraclePrice), history.netInvestedCollateral)
    : undefined
  const ownCapitalCollateral = decimalSum(
    history.netInvestedCollateral,
    decimalMultiply(history.borrowedCollateral, walletShare),
  )
  return {
    pnl,
    percent: percentOf(pnl, ownCapital),
    pnlCollateral,
    percentCollateral: percentOf(pnlCollateral, ownCapitalCollateral),
  }
}

export type PositionPnl = ReturnType<typeof positionPnl>
