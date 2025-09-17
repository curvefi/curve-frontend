import { useMemo } from 'react'
import { Address } from 'viem'
import { useUserCrvUsdCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-crvusd-collateral-events'
import { useUserLendCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-lend-collateral-events'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import {
  UserCollateralEvent as CrvUsdUserCollateralEvent,
  UserCollateralEvents as CrvUsdUserCollateralEvents,
} from '@curvefi/prices-api/crvusd'
import {
  UserCollateralEvent as LendingUserCollateralEvent,
  UserCollateralEvents as LendingUserCollateralEvents,
} from '@curvefi/prices-api/lending'

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

export type ParsedUserCollateralEvent = Omit<UserCollateralEvent, 'type'> & {
  type: UserCollateralEventType
  url: Address
  borrowToken:
    | {
        symbol: string
        address: string
        decimals: number
        name: string
      }
    | undefined
  collateralToken:
    | {
        symbol: string
        address: string
        decimals: number
        name: string
      }
    | undefined
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
  if (type === 'Borrow') return 'Borrow'
  if (type === 'Liquidate' && liquidation?.liquidator === user) return 'Self Liquidation'
  if (type === 'Liquidate') return 'Hard Liquidation'
  if (type === 'Repay' && isPositionClosed) return 'Repay and Close'
  if (type === 'Repay') return 'Repay'
  if (type === 'RemoveCollateral') return 'Remove Collateral'
  return type as UserCollateralEventType
}

type UseUserCollateralEventsProps = {
  app: 'lend' | 'crvusd'
  userAddress: string | undefined
  controllerAddress: string | undefined
  chainId: IChainId
  collateralToken:
    | {
        symbol: string
        address: string
        decimals: number
        name: string
      }
    | undefined
  borrowToken:
    | {
        symbol: string
        address: string
        decimals: number
        name: string
      }
    | undefined
}

export const useUserCollateralEvents = ({
  app,
  userAddress,
  controllerAddress,
  chainId,
  collateralToken,
  borrowToken,
}: UseUserCollateralEventsProps): {
  data: ParsedUserCollateralEvents | null
  isLoading: boolean
  isError: boolean
} => {
  const {
    data: lendData,
    isLoading: lendLoading,
    isError: lendError,
  } = useUserLendCollateralEventsQuery({
    chainId,
    controllerAddress,
    userAddress,
  })
  const {
    data: crvUsdData,
    isLoading: crvUsdLoading,
    isError: crvUsdError,
  } = useUserCrvUsdCollateralEventsQuery({
    chainId,
    controllerAddress,
    userAddress,
  })

  return useMemo(() => {
    const data = app === 'lend' ? lendData : crvUsdData
    const isLoading = app === 'lend' ? lendLoading : crvUsdLoading
    const isError = app === 'lend' ? lendError : crvUsdError

    const parsedData =
      data?.events
        .map((event, index) => ({
          ...event,
          type: parseEventType(event, data?.events[index - 1]),
          url: event.txHash,
          borrowToken,
          collateralToken,
        }))
        .reverse() || []

    return {
      data: data ? { ...data, events: parsedData } : null,
      isLoading,
      isError,
    }
  }, [app, lendData, crvUsdData, lendLoading, crvUsdLoading, lendError, crvUsdError, borrowToken, collateralToken])
}
