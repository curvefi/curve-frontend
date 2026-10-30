import { type PositionCapital, toPositionCapital } from '@/llamalend/position-pnl.utils'
import type { UserContractParams } from '@evm-ui/queries/query-types'
import { MarketType } from '@evm-ui/types/market'
import type { DefaultError, QueryKey } from '@tanstack/react-query'
import { type QueryOptions, useQuery } from '@ui/features/queries/query-hooks'
import type { ApiCollateralEvent } from '../collateral-events.utils'
import { getUserCrvUsdCollateralEventsOptions } from './user-crvusd-collateral-events'
import { getUserLendCollateralEventsOptions } from './user-lend-collateral-events'

const selectCapital = <TData extends { events: ApiCollateralEvent[] }, TKey extends QueryKey>(
  options: QueryOptions<TData, DefaultError, TData, TKey>,
): QueryOptions<TData, DefaultError, PositionCapital, TKey> => ({ ...options, select: toPositionCapital })

/** Own capital of the open position, selected from the collateral events query */
export const getPositionCapitalOptions = (marketType: MarketType, params: UserContractParams, enabled?: boolean) =>
  ({
    [MarketType.Lend]: selectCapital(getUserLendCollateralEventsOptions(params, enabled)),
    [MarketType.Mint]: selectCapital(getUserCrvUsdCollateralEventsOptions(params, enabled)),
  })[marketType]

export const usePositionCapital = (marketType: MarketType, params: UserContractParams, enabled = true) =>
  ({
    [MarketType.Lend]: useQuery(
      selectCapital(getUserLendCollateralEventsOptions(params, enabled && marketType === MarketType.Lend)),
    ),
    [MarketType.Mint]: useQuery(
      selectCapital(getUserCrvUsdCollateralEventsOptions(params, enabled && marketType === MarketType.Mint)),
    ),
  })[marketType]
