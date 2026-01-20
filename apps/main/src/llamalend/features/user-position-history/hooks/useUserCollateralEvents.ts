import { useMemo } from 'react'
import type { Address } from 'viem'
import { type Chain } from '@curvefi/prices-api'
import {
  UserCollateralEvent as CrvUsdUserCollateralEvent,
  UserCollateralEvents as CrvUsdUserCollateralEvents,
} from '@curvefi/prices-api/crvusd'
import {
  UserCollateralEvent as LendingUserCollateralEvent,
  UserCollateralEvents as LendingUserCollateralEvents,
} from '@curvefi/prices-api/lending'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import { useUserCrvUsdCollateralEventsQuery } from '../queries/user-crvusd-collateral-events'
import { useUserLendCollateralEventsQuery } from '../queries/user-lend-collateral-events'

type UserCollateralEvent = LendingUserCollateralEvent | CrvUsdUserCollateralEvent
type UserCollateralEvents = LendingUserCollateralEvents | CrvUsdUserCollateralEvents

/**
 * Types:
 * Add collateral = "Borrow" type when collateral incresases but debt doesn't.
 * Self liquidation = "Liquidate" when the liquidator is the user.
 * Hard liquidation = "Liquidate" when the liquidator is not the user.
 * Borrow more = "Borrow" type when debt increases but collateral doesn't.
 * Repay and Close = "Repay" when debt goes to 0.
 */
export type UserCollateralEventType =
  | 'Open Position'
  | 'Borrow'
  | 'Liquidate'
  | 'Repay'
  | 'Repay and Close'
  | 'Remove Collateral'
  | 'Borrow More'
  | 'Add Collateral'
  | 'Self Liquidation'
  | 'Hard Liquidation'

type CollateralEventToken = {
  symbol: string
  address: string
  decimals: number
  name: string
}

export type ParsedUserCollateralEvent = Omit<UserCollateralEvent, 'type'> & {
  type: UserCollateralEventType
  txUrl?: string
  url?: string | null
  borrowToken: CollateralEventToken | undefined
  collateralToken: CollateralEventToken | undefined
}
export type ParsedUserCollateralEvents = Omit<UserCollateralEvents, 'events'> & {
  events: ParsedUserCollateralEvent[]
}

const parseEventType = (
  event: UserCollateralEvent,
  previousEvent: UserCollateralEvent | undefined,
): UserCollateralEventType => {
  const { type, loanChange, collateralChange, liquidation, user, isPositionClosed } = event
  // if previous event == null it's the first event (must be open position).
  // if previous event is isPositionClosed === true, the next 'Borrow' must be open position.
  if (type === 'Borrow' && (previousEvent == null || previousEvent?.isPositionClosed)) return 'Open Position'
  if (type === 'Borrow' && loanChange > 0 && collateralChange === 0) return 'Borrow More'
  if (type === 'Borrow' && collateralChange > 0 && loanChange === 0) return 'Add Collateral'
  if (type === 'Liquidate' && liquidation?.liquidator === user) return 'Self Liquidation'
  if (type === 'Liquidate') return 'Hard Liquidation'
  if (type === 'Repay' && isPositionClosed) return 'Repay and Close'
  if (type === 'RemoveCollateral') return 'Remove Collateral'
  return type as UserCollateralEventType
}

type UseUserCollateralEventsProps = {
  app: 'lend' | 'crvusd'
  userAddress: Address | undefined
  controllerAddress: Address | undefined
  chain: Chain | undefined
  collateralToken: CollateralEventToken | undefined
  borrowToken: CollateralEventToken | undefined
  network: BaseConfig
}

export const useUserCollateralEvents = ({
  app,
  userAddress,
  controllerAddress,
  chain,
  collateralToken,
  borrowToken,
  network,
}: UseUserCollateralEventsProps): {
  data?: ParsedUserCollateralEvents
  isLoading: boolean
  isError: boolean
} => {
  const params = {
    blockchainId: chain,
    contractAddress: controllerAddress,
    userAddress,
  }
  const { data, isLoading, isError } = {
    lend: useUserLendCollateralEventsQuery(params, app == 'lend'),
    crvusd: useUserCrvUsdCollateralEventsQuery(params, app == 'crvusd'),
  }[app]

  return useMemo(
    () => ({
      ...(data && {
        data: {
          ...data,
          events:
            data?.events
              .map((event, index) => ({
                ...event,
                type: parseEventType(event, data?.events[index - 1]),
                txUrl: scanTxPath(network, event.txHash),
                borrowToken,
                collateralToken,
              }))
              .reverse() || [],
        },
      }),
      isLoading,
      isError,
    }),
    [data, isLoading, isError, network, borrowToken, collateralToken],
  )
}
