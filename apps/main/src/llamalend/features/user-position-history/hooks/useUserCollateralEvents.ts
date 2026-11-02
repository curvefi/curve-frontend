import { useMemo } from 'react'
import type { MarketTokens } from '@/llamalend/llama.utils'
import type { LlamaChainId } from '@evm-ui/features/connect-wallet/lib/types'
import type { UserContractQuery } from '@evm-ui/queries/query-types'
import { MarketType } from '@evm-ui/types/market'
import { BlockchainIds } from '@evm-ui/utils/network'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { q, type QueryProp } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import { type ApiCollateralEvent, getOpenPositionEvents } from '../collateral-events.utils'
import {
  invalidateUserCrvUsdCollateralEventsQuery,
  useUserCrvUsdCollateralEventsQuery,
} from '../queries/user-crvusd-collateral-events'
import {
  invalidateUserLendCollateralEventsQuery,
  useUserLendCollateralEventsQuery,
} from '../queries/user-lend-collateral-events'

/**
 * Types:
 * Add collateral = "Borrow" type when collateral incresases but debt doesn't.
 * Self liquidation = "Liquidate" when the liquidator is the user.
 * Hard liquidation = "Liquidate" when the liquidator is not the user.
 * Partial liquidation = "Repay" type with a liquidation object (lending API soft liquidation).
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
  | 'Partial Liquidation'

const OriginalFields = [
  'loanChange',
  'loanChangeUsd',
  'collateralChange',
  'collateralChangeUsd',
  'timestamp',
  'txHash',
] as const

export type ParsedUserCollateralEvent = Pick<ApiCollateralEvent, (typeof OriginalFields)[number]> & {
  chainId: number
  type: UserCollateralEventType
} & Partial<MarketTokens>

export type UserCollateralEvents = {
  events: ParsedUserCollateralEvent[]
  /** @deprecated Total deposit ÷ deposit from the user. Use `isZapLeveraged` to know if the position borrowed through the zap. */
  originalLeverage: Decimal
  /** The open position borrowed through the leverage zap */
  isZapLeveraged: boolean
}

/**
 * Whether the open position deposited through the leverage zap. Only events after the last closed position count, so a
 * closed leveraged loan doesn't mark a new plain borrow.
 */
const hasZapBorrowInOpenPosition = (events: ApiCollateralEvent[]) =>
  getOpenPositionEvents(events).some(e => e.leverage?.eventType === 'Deposit')

const parseEventType = (
  { type, loanChange, collateralChange, liquidation, user, isPositionClosed }: ApiCollateralEvent,
  previousEvent: ApiCollateralEvent | undefined,
): UserCollateralEventType => {
  // when !previousEvent it's the first event. if isPositionClosed, the next 'Borrow' must be 'Open position'
  if (type === 'Borrow' && (!previousEvent || previousEvent.isPositionClosed)) return 'Open Position'
  if (type === 'Borrow' && loanChange > 0 && collateralChange === 0) return 'Borrow More'
  if (type === 'Borrow' && collateralChange > 0 && loanChange === 0) return 'Add Collateral'
  if (type === 'Repay' && liquidation != null) return 'Partial Liquidation'
  if (type === 'Liquidate' && liquidation?.liquidator === user) return 'Self Liquidation'
  if (type === 'Liquidate') return 'Hard Liquidation'
  if (type === 'Repay' && isPositionClosed) return 'Repay and Close'
  if (type === 'RemoveCollateral') return 'Remove Collateral'
  return type
}

export type UserCollateralEventsProps = {
  app: MarketType
  userAddress: Address | undefined
  controllerAddress: Address | undefined
  chainId: LlamaChainId
  tokens: Partial<MarketTokens>
}

export const useUserCollateralEvents = ({
  app,
  userAddress,
  controllerAddress,
  chainId,
  tokens: { collateralToken, borrowToken },
}: UserCollateralEventsProps): QueryProp<UserCollateralEvents> => {
  const params = { blockchainId: BlockchainIds[chainId], contractAddress: controllerAddress, userAddress }
  const { data, isLoading, error } = {
    [MarketType.Lend]: useUserLendCollateralEventsQuery(params, app === MarketType.Lend),
    [MarketType.Mint]: useUserCrvUsdCollateralEventsQuery(params, app === MarketType.Mint),
  }[app]
  return useMemo(
    () =>
      q({
        data: data && {
          originalLeverage: Number(data.totalDepositFromUserPrecise)
            ? decimalDiv(data.totalDepositPrecise, data.totalDepositFromUserPrecise)
            : '0', // deposit should only be 0 if there is no loan, this is just a guard for div-by-zero errors
          isZapLeveraged: hasZapBorrowInOpenPosition(data.events),
          events:
            data.events
              .map((event, index, events) => ({
                chainId,
                type: parseEventType(event, events[index - 1]),
                borrowToken,
                collateralToken,
                ...pick(event, ...OriginalFields),
              }))
              .toReversed() || [],
        },
        isLoading,
        error,
      }),
    [data, isLoading, error, chainId, borrowToken, collateralToken],
  )
}

export const invalidateUserCollateralEvents = (params: UserContractQuery) =>
  Promise.all([invalidateUserLendCollateralEventsQuery(params), invalidateUserCrvUsdCollateralEventsQuery(params)])
