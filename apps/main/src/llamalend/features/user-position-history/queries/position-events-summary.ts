import { type PositionCapital, toPositionCapital } from '@/llamalend/position-pnl.utils'
import type { UserContractParams } from '@evm-ui/queries/query-types'
import { MarketType } from '@evm-ui/types/market'
import type { Decimal } from '@primitives/decimal.utils'
import type { Nullish } from '@primitives/objects.utils'
import type { DefaultError, QueryKey } from '@tanstack/react-query'
import { type QueryOptions, useQuery } from '@ui/features/queries/query-hooks'
import { type ApiCollateralEvent, getOpeningLeverage, hasZapBorrowInOpenPosition } from '../collateral-events.utils'
import { getUserCrvUsdCollateralEventsOptions } from './user-crvusd-collateral-events'
import { getUserLendCollateralEventsOptions } from './user-lend-collateral-events'

type PositionEventsSummary = { capital: PositionCapital; isZapLeveraged: boolean; openingLeverage: Decimal | Nullish }

const toPositionEventsSummary = <TData extends { events: ApiCollateralEvent[] }>(
  data: TData,
): PositionEventsSummary => ({
  capital: toPositionCapital(data),
  isZapLeveraged: hasZapBorrowInOpenPosition(data.events),
  openingLeverage: getOpeningLeverage(data.events),
})

/** The return type of the exported options can't be inferred from the spread query options */
const selectFromEvents = <TData extends { events: ApiCollateralEvent[] }, TKey extends QueryKey, TResult>(
  options: QueryOptions<TData, DefaultError, TData, TKey>,
  select: (data: TData) => TResult,
): QueryOptions<TData, DefaultError, TResult, TKey> => ({ ...options, select })

/** Own capital, whether the borrow went through the leverage zap and the opening leverage, selected from the collateral events query */
export const getPositionEventsSummaryOptions = (
  marketType: MarketType,
  params: UserContractParams,
  enabled?: boolean,
) =>
  ({
    [MarketType.Lend]: selectFromEvents(getUserLendCollateralEventsOptions(params, enabled), toPositionEventsSummary),
    [MarketType.Mint]: selectFromEvents(getUserCrvUsdCollateralEventsOptions(params, enabled), toPositionEventsSummary),
  })[marketType]

export const usePositionCapital = (marketType: MarketType, params: UserContractParams, enabled = true) =>
  ({
    [MarketType.Lend]: useQuery({
      ...getUserLendCollateralEventsOptions(params, enabled && marketType === MarketType.Lend),
      select: toPositionCapital,
    }),
    [MarketType.Mint]: useQuery({
      ...getUserCrvUsdCollateralEventsOptions(params, enabled && marketType === MarketType.Mint),
      select: toPositionCapital,
    }),
  })[marketType]
