import { type PositionCashFlows, toPositionCashFlows } from '@/llamalend/position-pnl.utils'
import type { UserContractParams } from '@evm-ui/queries/query-types'
import { MarketType } from '@evm-ui/types/market'
import type { DefaultError, QueryKey } from '@tanstack/react-query'
import { type QueryOptions, useQuery } from '@ui/features/queries/query-hooks'
import type { ApiCollateralEvent } from '../collateral-events.utils'
import { getUserCrvUsdCollateralEventsOptions } from './user-crvusd-collateral-events'
import { getUserLendCollateralEventsOptions } from './user-lend-collateral-events'

const selectCashFlows = <TData extends { events: ApiCollateralEvent[] }, TKey extends QueryKey>(
  options: QueryOptions<TData, DefaultError, TData, TKey>,
): QueryOptions<TData, DefaultError, PositionCashFlows, TKey> => ({ ...options, select: toPositionCashFlows })

/** Cash flows of the open position, selected from the collateral events query the activity tab also uses */
export const getPositionCashFlowsOptions = (marketType: MarketType, params: UserContractParams, enabled?: boolean) =>
  ({
    [MarketType.Lend]: selectCashFlows(getUserLendCollateralEventsOptions(params, enabled)),
    [MarketType.Mint]: selectCashFlows(getUserCrvUsdCollateralEventsOptions(params, enabled)),
  })[marketType]

export const usePositionCashFlows = (marketType: MarketType, params: UserContractParams, enabled = true) =>
  ({
    [MarketType.Lend]: useQuery(
      selectCashFlows(getUserLendCollateralEventsOptions(params, enabled && marketType === MarketType.Lend)),
    ),
    [MarketType.Mint]: useQuery(
      selectCashFlows(getUserCrvUsdCollateralEventsOptions(params, enabled && marketType === MarketType.Mint)),
    ),
  })[marketType]
