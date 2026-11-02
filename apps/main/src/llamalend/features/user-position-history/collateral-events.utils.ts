import type { UserCollateralEvent as CrvUsdUserCollateralEvent } from '@curvefi/prices-api/crvusd'
import type { UserCollateralEvent as LendingUserCollateralEvent } from '@curvefi/prices-api/lending'

export type ApiCollateralEvent = LendingUserCollateralEvent | CrvUsdUserCollateralEvent

/** The events of the open position: the ones after the last closed position. `events` are oldest first, as the API sends them. */
export const getOpenPositionEvents = (events: ApiCollateralEvent[]) =>
  events.slice(events.findLastIndex(e => e.isPositionClosed) + 1)
