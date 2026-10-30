import {
  type ApiCollateralEvent,
  getOpenPositionEvents,
} from '@/llamalend/features/user-position-history/collateral-events.utils'
import type { Amount, Decimal } from '@primitives/decimal.utils'
import { formatNumber, type NumberFormatCategory } from '@primitives/number.utils'
import { maybe, type Nullish } from '@primitives/objects.utils'
import {
  decimal,
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
  decimalNegate,
  decimalPercent,
  decimalSum,
  ZERO,
} from '@ui/lib/decimal'

/** The user's own capital in the open position, in one token. */
type Capital = {
  /** Value moved from the user's wallet into the position, negative once they withdrew more than they put in, e.g. after taking profit */
  netInvested: Decimal
  /**
   * Borrowed tokens sent to the wallet, minus the ones repaid from it.
   * Negative when the wallet repaid more than it received, e.g. a zap-opened loan repaid with wallet funds.
   */
  walletBorrowed: Decimal
}

/** Own capital of the open position in the debt token, and in the collateral token at each event's oracle price */
export type PositionCapital = { debt: Capital; collateral: Capital } | null

/** PNL and ROE (%) in one token. ROE divides the PNL by own capital: netInvested + max(walletBorrowed, 0) */
type PnlAndRoe = { pnl: Decimal; roe: Decimal | null }

/** PNL and ROE (%) of the open position, in the debt token and in the collateral token */
export type PositionPnlAndRoe = { debt: PnlAndRoe; collateral: PnlAndRoe | null }

/**
 * What one event did to the user's own capital, in the debt token at the event's oracle price.
 * `flow`: value the wallet put into the position, negative when the position paid the wallet.
 * `walletBorrowed`: borrowed tokens the event sent to the wallet, negative for repays from it.
 */
type EventFlow = { flow: Decimal; walletBorrowed: Decimal }

const toDecimal = (value: number | Nullish) => decimal(value) ?? ZERO

/** For events whose borrowed tokens never reach the wallet (zaps, liquidations): only the flow counts */
const ownFlow = (flow: Decimal): EventFlow => ({ flow, walletBorrowed: ZERO })

/** The user closes the position through a liquidation of their own loan: the wallet pays the debt the AMM crvUSD does not cover and gets the collateral back */
const closePositionFlow = ({ liquidation, user, oraclePrice }: ApiCollateralEvent) =>
  liquidation?.liquidator.toLowerCase() === user.toLowerCase()
    ? ownFlow(
        decimalMinus(
          toDecimal(liquidation.debt),
          toDecimal(liquidation.stablecoinReceived),
          decimalMultiply(toDecimal(liquidation.collateralReceived), oraclePrice),
        ),
      )
    : undefined

const liquidationFlow = ({ liquidation }: ApiCollateralEvent) => maybe(liquidation, () => ownFlow(ZERO))

const zapDepositFlow = ({ leverage, oraclePrice }: ApiCollateralEvent) =>
  leverage?.eventType === 'Deposit'
    ? ownFlow(
        decimalSum(decimalMultiply(toDecimal(leverage.userCollateral), oraclePrice), toDecimal(leverage.userBorrowed)),
      )
    : undefined

const zapRepayFlow = ({ leverage, oraclePrice, loanChange }: ApiCollateralEvent): EventFlow | undefined =>
  leverage?.eventType === 'Repay'
    ? {
        flow: decimalMinus(
          decimalMultiply(toDecimal(leverage.userCollateral), oraclePrice),
          toDecimal(loanChange),
          toDecimal(leverage.borrowedFromStateCollateral),
          toDecimal(leverage.borrowedFromUserCollateral),
        ),
        // Borrowed tokens the wallet paid into the zap repay, like a plain repay from the wallet
        walletBorrowed: decimalNegate(toDecimal(leverage.userBorrowed)),
      }
    : undefined

const plainFlow = ({ collateralChange, loanChange, oraclePrice }: ApiCollateralEvent): EventFlow => ({
  flow: decimalMinus(decimalMultiply(toDecimal(collateralChange), oraclePrice), toDecimal(loanChange)),
  walletBorrowed: toDecimal(loanChange),
})

/**
 * Rules in order, the first match wins:
 * - closing the position is also a liquidation, so it is checked first
 * - zap events also carry collateral and loan changes that include the swapped amounts, so they read the zap fields instead
 * - anything else is a plain deposit, withdrawal, borrow or repay
 * Only plain events send borrowed tokens to the wallet: a zap borrow buys collateral and a liquidation repays debt.
 */
const getEventFlow = (event: ApiCollateralEvent): EventFlow =>
  closePositionFlow(event) ?? liquidationFlow(event) ?? zapDepositFlow(event) ?? zapRepayFlow(event) ?? plainFlow(event)

/** Folds the collateral events of the open position into its own capital. Null when the open position has no events. */
export const toPositionCapital = ({ events }: { events: ApiCollateralEvent[] }): PositionCapital => {
  const openEvents = getOpenPositionEvents(events)
  if (!openEvents.length) return null
  const flows = openEvents.map(event => ({ price: toDecimal(event.oraclePrice), ...getEventFlow(event) }))
  // Without an oracle price an event's collateral can't be valued, in either token
  if (flows.some(({ price }) => decimalEqual(price, ZERO))) return null
  const sum = (toValue: (flow: (typeof flows)[number]) => Decimal) => decimalSum(...flows.map(toValue))
  return {
    debt: { netInvested: sum(({ flow }) => flow), walletBorrowed: sum(({ walletBorrowed }) => walletBorrowed) },
    collateral: {
      netInvested: sum(({ flow, price }) => decimalDiv(flow, price)),
      walletBorrowed: sum(({ walletBorrowed, price }) => decimalDiv(walletBorrowed, price)),
    },
  }
}

const getPnlAndRoe = (equity: Decimal, { netInvested, walletBorrowed }: Capital): PnlAndRoe => {
  const pnl = decimalMinus(equity, netInvested)
  const totalCapital = decimalSum(netInvested, decimalGreaterThan(walletBorrowed, ZERO) ? walletBorrowed : ZERO)
  return { pnl, roe: decimalGreaterThan(totalCapital, ZERO) ? decimalPercent(pnl, totalCapital) : null }
}

/** PNL and ROE of the open position from its equity (in the debt token) and its own capital. Null without capital. */
export const getPositionPnlAndRoe = ({
  equity,
  oraclePrice,
  capital,
}: {
  equity: Decimal
  oraclePrice: Decimal
  capital: PositionCapital
}): PositionPnlAndRoe | null =>
  capital && {
    debt: getPnlAndRoe(equity, capital.debt),
    collateral: +oraclePrice ? getPnlAndRoe(decimalDiv(equity, oraclePrice), capital.collateral) : null,
  }

/** Formats a PNL or ROE value with a + sign when it is positive */
export const formatSigned = (value: Amount, category: NumberFormatCategory) =>
  `${Number(value) > 0 ? '+' : ''}${formatNumber(value, category)}`
