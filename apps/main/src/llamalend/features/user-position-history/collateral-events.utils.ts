import { getEquityLeverage } from '@/llamalend/equity-leverage.utils'
import type { UserCollateralEvent as CrvUsdUserCollateralEvent } from '@curvefi/prices-api/crvusd'
import type { UserCollateralEvent as LendingUserCollateralEvent } from '@curvefi/prices-api/lending'
import { maybe, maybes } from '@primitives/objects.utils'
import { decimal, ZERO } from '@ui/lib/decimal'

export type ApiCollateralEvent = LendingUserCollateralEvent | CrvUsdUserCollateralEvent

/** The events of the open position: the ones after the last closed position. `events` are oldest first, as the API sends them. */
export const getOpenPositionEvents = (events: ApiCollateralEvent[]) =>
  events.slice(events.findLastIndex(e => e.isPositionClosed) + 1)

const isZapDeposit = ({ leverage }: ApiCollateralEvent) => leverage?.eventType === 'Deposit'

/**
 * Whether the open position deposited through the leverage zap. Only events after the last closed position count, so a
 * closed leveraged loan doesn't mark a new plain borrow.
 */
export const hasZapBorrowInOpenPosition = (events: ApiCollateralEvent[]) =>
  getOpenPositionEvents(events).some(isZapDeposit)

/**
 * The leverage the open position opened at: the equity leverage of its first event when that is a zap deposit.
 * Undefined when the position opened another way, null without equity.
 */
export const getOpeningLeverage = (events: ApiCollateralEvent[]) =>
  maybe(getOpenPositionEvents(events).at(0), event =>
    isZapDeposit(event)
      ? maybes(
          [decimal(event.collateralChange), decimal(event.loanChange), decimal(event.oraclePrice)],
          (collateral, debt, oraclePrice) =>
            getEquityLeverage({ collateral, convertedBorrowed: ZERO, debt }, oraclePrice),
        )
      : undefined,
  )
