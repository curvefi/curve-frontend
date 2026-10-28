import {
  type ApiCollateralEvent,
  getOpenPositionEvents,
} from '@/llamalend/features/user-position-history/collateral-events.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, type Nullish } from '@primitives/objects.utils'
import {
  decimal,
  decimalDiv,
  decimalEqual,
  decimalGreaterThan,
  decimalMinus,
  decimalMultiply,
  decimalPercent,
  decimalSum,
  ZERO,
} from '@ui/lib/decimal'

/** The user's own capital in the open position, in one token. */
type Capital = {
  /** Value moved from the user's wallet into the position, negative when the user received more than they put in */
  netInvested: Decimal
  /** Borrowed tokens sent to the user's wallet, net of repays: negative when wallet repays exceed them, e.g. after a zap borrow */
  walletBorrowed: Decimal
}

/** Own capital of the open position in the debt token, and in the collateral token at each event's oracle price */
export type PositionCapital = { debt: Capital; collateral: Capital | null } | null

type PnlAndRoe = { pnl: Decimal; roe: Decimal | null }

/** PNL and ROE (%) of the open position, in the debt token and in the collateral token */
export type PositionPnlAndRoe = { debt: PnlAndRoe; collateral: PnlAndRoe | null }

/** An event's own flow and wallet borrow, in the debt token at the event's oracle price */
type EventFlow = { flow: Decimal; walletBorrowed: Decimal }

const toDecimal = (value: number | Nullish) => decimal(value) ?? ZERO

const ownFlow = (flow: Decimal): EventFlow => ({ flow, walletBorrowed: ZERO })

const selfLiquidation = ({ liquidation, user, oraclePrice }: ApiCollateralEvent) =>
  liquidation?.liquidator.toLowerCase() === user.toLowerCase()
    ? ownFlow(
        decimalMinus(
          toDecimal(liquidation.debt),
          toDecimal(liquidation.stablecoinReceived),
          decimalMultiply(toDecimal(liquidation.collateralReceived), oraclePrice),
        ),
      )
    : undefined

const liquidation = ({ liquidation }: ApiCollateralEvent) => maybe(liquidation, () => ownFlow(ZERO))

const zapDeposit = ({ leverage, oraclePrice }: ApiCollateralEvent) =>
  leverage?.eventType === 'Deposit'
    ? ownFlow(
        decimalSum(decimalMultiply(toDecimal(leverage.userCollateral), oraclePrice), toDecimal(leverage.userBorrowed)),
      )
    : undefined

const zapRepay = ({ leverage, oraclePrice, loanChange }: ApiCollateralEvent) =>
  leverage?.eventType === 'Repay'
    ? ownFlow(
        decimalMinus(
          decimalMultiply(toDecimal(leverage.userCollateral), oraclePrice),
          toDecimal(loanChange),
          toDecimal(leverage.borrowedFromStateCollateral),
          toDecimal(leverage.borrowedFromUserCollateral),
        ),
      )
    : undefined

const plain = ({ collateralChange, loanChange, oraclePrice }: ApiCollateralEvent): EventFlow => ({
  flow: decimalMinus(decimalMultiply(toDecimal(collateralChange), oraclePrice), toDecimal(loanChange)),
  walletBorrowed: toDecimal(loanChange),
})

/** First match wins. Only plain events borrow to the wallet: zap borrows buy collateral, liquidations repay debt. */
const getEventFlow = (event: ApiCollateralEvent): EventFlow =>
  selfLiquidation(event) ?? liquidation(event) ?? zapDeposit(event) ?? zapRepay(event) ?? plain(event)

/** Folds the collateral events of the open position into its own capital. Null when the open position has no events. */
export const toPositionCapital = ({ events }: { events: ApiCollateralEvent[] }): PositionCapital => {
  const openEvents = getOpenPositionEvents(events)
  if (!openEvents.length) return null
  const flows = openEvents.map(event => ({ price: toDecimal(event.oraclePrice), ...getEventFlow(event) }))
  const sum = (toValue: (flow: (typeof flows)[number]) => Decimal) => decimalSum(...flows.map(toValue))
  return {
    debt: { netInvested: sum(({ flow }) => flow), walletBorrowed: sum(({ walletBorrowed }) => walletBorrowed) },
    collateral: flows.some(({ price }) => decimalEqual(price, ZERO))
      ? null
      : {
          netInvested: sum(({ flow, price }) => decimalDiv(flow, price)),
          walletBorrowed: sum(({ walletBorrowed, price }) => decimalDiv(walletBorrowed, price)),
        },
  }
}

const getPnlAndRoe = (equity: Decimal, { netInvested, walletBorrowed }: Capital, roeEnabled: boolean): PnlAndRoe => {
  const pnl = decimalMinus(equity, netInvested)
  const totalCapital = decimalSum(netInvested, decimalGreaterThan(walletBorrowed, ZERO) ? walletBorrowed : ZERO)
  return { pnl, roe: roeEnabled && decimalGreaterThan(totalCapital, ZERO) ? decimalPercent(pnl, totalCapital) : null }
}

/** PNL and ROE of the open position from its equity (in the debt token) and its own capital. Null without capital. */
export const getPositionPnlAndRoe = ({
  equity,
  oraclePrice,
  capital,
  roeEnabled,
}: {
  equity: Decimal
  oraclePrice: Decimal
  capital: PositionCapital
  roeEnabled: boolean
}): PositionPnlAndRoe | null =>
  capital && {
    debt: getPnlAndRoe(equity, capital.debt, roeEnabled),
    collateral:
      capital.collateral && !decimalEqual(oraclePrice, ZERO)
        ? getPnlAndRoe(decimalDiv(equity, oraclePrice), capital.collateral, roeEnabled)
        : null,
  }
