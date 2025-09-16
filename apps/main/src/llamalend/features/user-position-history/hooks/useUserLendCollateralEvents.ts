import { useMemo } from 'react'
import { useUserLendCollateralEventsQuery } from '@/llamalend/features/user-position-history/queries/user-lend-collateral-events'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { UserCollateralEvent, UserCollateralEvents } from '@curvefi/prices-api/lending'

/**
 * Types:
 * Add collateral = "Borrow" type when collateral incresases but debt doesn't.
 * Self liquidation = "Liquidate" when the liquidator is the user.
 * Hard liquidation = "Liquidate" when the liquidator is not the user.
 * Borrow more = "Borrow" type when debt increases but collateral doesn't.
 * Repay and Close = "Repay" when debt goes to 0.
 */
export type UserLendCollateralEventType =
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

export type ParsedUserLendCollateralEvent = Omit<UserCollateralEvent, 'type'> & {
  type: UserLendCollateralEventType
  url: string
  borrowToken: {
    symbol: string
    address: string
  }
  collateralToken: {
    symbol: string
    address: string
  }
}
export type ParsedUserLendCollateralEvents = Omit<UserCollateralEvents, 'events'> & {
  events: ParsedUserLendCollateralEvent[]
}

const parseEventType = (
  event: UserCollateralEvent,
  previousEvent: UserCollateralEvent | undefined,
): UserLendCollateralEventType => {
  const { type, loanChange, collateralChange, liquidation, user, isPositionClosed } = event
  // if previous event == null it's the first event (must be open position).
  // if previous event is isPositionClosed === true, the next 'Borrow' must be open position.
  if (type === 'Borrow' && (previousEvent == null || previousEvent?.isPositionClosed)) return 'Open Position'
  if (type === 'Borrow' && loanChange > 0 && collateralChange === 0) return 'Borrow More'
  if (type === 'Borrow' && collateralChange > 0 && loanChange === 0) return 'Add Collateral'
  if (type === 'Liquidate' && liquidation?.liquidator === user) return 'Self Liquidation'
  if (type === 'Liquidate' && liquidation?.liquidator !== user) return 'Hard Liquidation'
  if (type === 'Repay' && isPositionClosed) return 'Repay and Close'
  if (type === 'Repay' && collateralChange === 0) return 'Repay'
  if (type === 'RemoveCollateral') return 'Remove Collateral'
  return type as UserLendCollateralEventType
}

type UseUserLendCollateralEventsProps = {
  userAddress: string
  controllerAddress: string
  chainId: IChainId
  collateralToken: {
    symbol: string
    address: string
  }
  borrowToken: {
    symbol: string
    address: string
  }
}

export const useUserLendCollateralEvents = ({
  userAddress,
  controllerAddress,
  chainId,
  collateralToken,
  borrowToken,
}: UseUserLendCollateralEventsProps): {
  data: ParsedUserLendCollateralEvents | null
  isLoading: boolean
  isError: boolean
} => {
  const { data, isLoading, isError } = useUserLendCollateralEventsQuery({
    chainId,
    controllerAddress,
    userAddress,
  })

  return useMemo(() => {
    const parsedData =
      data?.events
        .map((event, index) => ({
          ...event,
          type: parseEventType(event, data?.events[index - 1]),
          url: event.txHash ? `#${event.txHash}` : '#',
          borrowToken,
          collateralToken,
        }))
        .reverse() || []

    return {
      data: data
        ? {
            ...data,
            events: parsedData,
          }
        : null,
      isLoading,
      isError,
    }
  }, [data, borrowToken, collateralToken, isLoading, isError])
}
