import { useMemo } from 'react'
import { type Chain } from '@curvefi/prices-api'
import { UserCollateralEvent as CrvUsdUserCollateralEvent } from '@curvefi/prices-api/crvusd'
import { UserCollateralEvent as LendingUserCollateralEvent } from '@curvefi/prices-api/lending'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import { scanTxPath, type BaseConfig } from '@ui/utils'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { q, type QueryProp } from '@ui-kit/types/util'
import { decimalDiv } from '@ui-kit/utils'
import { useUserCrvUsdCollateralEventsQuery } from '../queries/user-crvusd-collateral-events'
import { useUserLendCollateralEventsQuery } from '../queries/user-lend-collateral-events'

type UserCollateralEventFromApi = LendingUserCollateralEvent | CrvUsdUserCollateralEvent

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

const OriginalFields = ['loanChange', 'collateralChange', 'collateralChangeUsd', 'timestamp'] as const

type CollateralEventToken = { symbol: string; address: string; decimals: number; name: string }

export type ParsedUserCollateralEvent = Pick<UserCollateralEventFromApi, (typeof OriginalFields)[number]> &
  TableItem & {
    type: UserCollateralEventType
    borrowToken: CollateralEventToken | undefined
    collateralToken: CollateralEventToken | undefined
  }

export type UserCollateralEvents = {
  events: ParsedUserCollateralEvent[]
  originalLeverage: Decimal
}

const parseEventType = (
  { type, loanChange, collateralChange, liquidation, user, isPositionClosed }: UserCollateralEventFromApi,
  previousEvent: UserCollateralEventFromApi | undefined,
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
  return type as UserCollateralEventType
}

export type UserCollateralEventsProps = {
  app: LlamaMarketType
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
}: UserCollateralEventsProps): QueryProp<UserCollateralEvents> => {
  const params = { blockchainId: chain, contractAddress: controllerAddress, userAddress }
  const { data, isLoading, error } = {
    [LlamaMarketType.Lend]: useUserLendCollateralEventsQuery(params, app === LlamaMarketType.Lend),
    [LlamaMarketType.Mint]: useUserCrvUsdCollateralEventsQuery(params, app === LlamaMarketType.Mint),
  }[app]
  return useMemo(
    () =>
      q({
        data: data && {
          originalLeverage: Number(data.totalDepositFromUserPrecise)
            ? decimalDiv(data.totalDepositPrecise, data.totalDepositFromUserPrecise)
            : '0', // deposit should only be 0 if there is no loan, this is just a guard for div-by-zero errors
          events:
            data.events
              .map((event, index, events) => ({
                type: parseEventType(event, events[index - 1]),
                url: scanTxPath(network, event.txHash),
                borrowToken,
                collateralToken,
                ...pick(event, ...OriginalFields),
              }))
              .reverse() || [],
        },
        isLoading,
        error,
      }),
    [data, isLoading, error, network, borrowToken, collateralToken],
  )
}
