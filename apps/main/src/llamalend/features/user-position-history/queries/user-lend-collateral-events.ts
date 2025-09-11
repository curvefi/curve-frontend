import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents, UserCollateralEvents, UserCollateralEvent } from '@curvefi/prices-api/lending'
import { NETWORK_BASE_CONFIG } from '@ui/utils'
import { FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import type { ChainQuery } from '@ui-kit/lib/model/query'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type UserLendCollateralEventsQuery = ChainQuery<IChainId> & { controllerAddress: string; userAddress: string }
type UserLendCollateralEventsParams = FieldsOf<UserLendCollateralEventsQuery>

/**
 * Types:
 * Add collateral = "Borrow" type when collateral incresases but debt doesn't.
 * Self liquidation = "Liquidate" when the liquidator is the user.
 * Hard liquidation = "Liquidate" when the liquidator is not the user.
 * Borrow more = "Borrow" type when debt increases but collateral doesn't.
 * Repay and Close = "Repay" when debt goes to 0.
 */

export type UserLendCollateralEventType =
  | 'Borrow'
  | 'Liquidate'
  | 'Repay'
  | 'Remove Collateral'
  | 'Borrow More'
  | 'Add Collateral'
  | 'Self Liquidation'
  | 'Hard Liquidation'

export type ParsedUserLendCollateralEvent = Omit<UserCollateralEvent, 'type'> & {
  type: UserLendCollateralEventType
  url: string
}
export type ParsedUserLendCollateralEvents = Omit<UserCollateralEvents, 'events'> & {
  events: ParsedUserLendCollateralEvent[]
}

const parseEventType = (
  type: UserCollateralEvents['events'][number]['type'],
  collateralChange: number,
  loanChange: number,
  liquidator: string,
  user: string,
): UserLendCollateralEventType => {
  if (type === 'Borrow' && loanChange > 0 && collateralChange === 0) return 'Borrow More'
  if (type === 'Borrow' && collateralChange > 0 && loanChange === 0) return 'Add Collateral'
  if (type === 'Liquidate' && liquidator === user) return 'Self Liquidation'
  if (type === 'Liquidate' && liquidator !== user) return 'Hard Liquidation'
  if (type === 'Repay' && collateralChange === 0) return 'Repay'
  if (type === 'RemoveCollateral') return 'Remove Collateral'
  return type as UserLendCollateralEventType
}

export const { useQuery: useUserLendCollateralEvents, invalidate: invalidateUserLendCollateralEvents } = queryFactory({
  queryKey: ({ chainId, controllerAddress, userAddress }: UserLendCollateralEventsParams) =>
    ['userLendCollateralEvents', { chainId }, { controllerAddress }, { userAddress }, 'v1'] as const,
  queryFn: async ({
    chainId,
    controllerAddress,
    userAddress,
  }: UserLendCollateralEventsQuery): Promise<ParsedUserLendCollateralEvents> => {
    const chain = NETWORK_BASE_CONFIG[chainId].id as Chain
    const response = await getUserMarketCollateralEvents(userAddress, chain, controllerAddress)
    return {
      ...response,
      events: response.events.map((event) => ({
        ...event,
        type: parseEventType(
          event.type,
          event.collateralChange,
          event.loanChange,
          event.liquidation?.liquidator ?? '',
          event.user,
        ),
        url: event.txHash ? `#${event.txHash}` : '#',
      })),
    }
  },
  refetchInterval: '1m',
  validationSuite: llamaApiValidationSuite,
})
