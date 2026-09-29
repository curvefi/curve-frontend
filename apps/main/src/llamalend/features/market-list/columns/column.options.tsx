import { MarketRateType } from '@evm-ui/types/market'
import { fromEntries, notFalsy, recordValues } from '@primitives/objects.utils'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import { t } from '@ui/lib/i18n'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'

/**
 * Create a map of column visibility for the markets table on mobile devices.
 * On mobile that is just the market title and the column that is currently sorted.
 */
export const createMarketsMobileColumns = (sortBy: MarketColumnId) =>
  fromEntries(recordValues(MarketColumnId).map(key => [key, key === MarketColumnId.Assets || key === sortBy]))

/**
 * Create a map of column visibility for the markets table that can be customized by the user.
 * This is not used on mobile devices (see `createMarketsMobileColumns` above).
 * @param hasPositions Whether the user is connected and has positions. Undefined during loading.
 * @param onlyPositions If set, only show columns related to the given position type.
 *      Otherwise, show all columns related to general market info and both position types (optionally).
 */
const createMarketsColumnOptions = ({
  hasPositions,
  onlyPositions,
  beta,
}: {
  hasPositions: boolean
  onlyPositions?: MarketRateType
  beta: boolean
}): VisibilityGroup<MarketColumnId>[] => [
  {
    label: t`Markets`,
    options: [
      {
        label: MARKET_TITLES[MarketColumnId.MaxLeverage],
        columns: [MarketColumnId.MaxLeverage],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.MaxReturnOnEquity],
        columns: [MarketColumnId.MaxReturnOnEquity],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.LiquidityUsd],
        columns: [MarketColumnId.LiquidityUsd],
        active: !onlyPositions,
        enabled: true,
      },
      { label: MARKET_TITLES[MarketColumnId.MaxLtv], columns: [MarketColumnId.MaxLtv], active: false, enabled: true },
      {
        label: MARKET_TITLES[MarketColumnId.UtilizationPercent],
        columns: [MarketColumnId.UtilizationPercent],
        active: !onlyPositions,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.SolvencyPercent],
        columns: [MarketColumnId.SolvencyPercent],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.TotalDebt],
        columns: [MarketColumnId.TotalDebt],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.TotalCollateralUsd],
        columns: [MarketColumnId.TotalCollateralUsd],
        active: false,
        enabled: true,
      },
      {
        label: MARKET_TITLES[MarketColumnId.Tvl],
        columns: [MarketColumnId.Tvl],
        active: !onlyPositions,
        enabled: true,
      },
    ],
  },
  {
    label: t`Borrow`,
    options: [
      ...notFalsy(
        beta && {
          label: MARKET_TITLES[MarketColumnId.BorrowRate],
          columns: [MarketColumnId.BorrowRate],
          active: onlyPositions != MarketRateType.Supply,
          enabled: true,
        },
      ),
      {
        label: beta ? MARKET_TITLES[MarketColumnId.NetBorrowRate] : t`Net borrow APR`,
        columns: [MarketColumnId.NetBorrowRate],
        active: !beta && onlyPositions != MarketRateType.Supply,
        enabled: true,
      },
      ...notFalsy(
        beta
          ? undefined
          : {
              label: MARKET_TITLES[MarketColumnId.BorrowRate],
              columns: [MarketColumnId.BorrowRate],
              active: false,
              enabled: true,
            },
      ),
      ...(beta
        ? [
            {
              label: MARKET_TITLES[MarketColumnId.CollateralYield],
              columns: [MarketColumnId.CollateralYield],
              active: false,
              enabled: true,
            },
            {
              label: MARKET_TITLES[MarketColumnId.UserReturnOnEquity],
              columns: [MarketColumnId.UserReturnOnEquity],
              active: onlyPositions == MarketRateType.Borrow,
              enabled: hasPositions,
            },
            {
              label: MARKET_TITLES[MarketColumnId.UserLeverage],
              columns: [MarketColumnId.UserLeverage],
              active: onlyPositions == MarketRateType.Borrow,
              enabled: hasPositions,
            },
          ]
        : []),
      {
        label: t`Borrow Details`,
        columns: [
          MarketColumnId.UserHealth,
          MarketColumnId.UserBorrowed,
          MarketColumnId.UserCollateral,
          MarketColumnId.UserLtv,
        ],
        active: onlyPositions == MarketRateType.Borrow,
        enabled: hasPositions,
      },
      ...notFalsy(
        beta && {
          label: MARKET_TITLES[MarketColumnId.UserLiquidationBuffer],
          columns: [MarketColumnId.UserLiquidationBuffer],
          active: false,
          enabled: hasPositions,
        },
      ),
      { label: t`Chart`, columns: [MarketColumnId.BorrowChart], active: false, enabled: true },
    ],
  },
  {
    label: t`Lend`,
    options: [
      {
        label: MARKET_TITLES[MarketColumnId.LendRate],
        columns: [MarketColumnId.LendRate],
        active: onlyPositions != MarketRateType.Borrow,
        enabled: true,
      },
      {
        label: t`Lend Details`,
        columns: [MarketColumnId.UserEarnings, MarketColumnId.UserDeposited, MarketColumnId.UserBoostMultiplier],
        active: onlyPositions == MarketRateType.Supply,
        enabled: hasPositions,
      },
    ],
  },
]

/** We keep visibility settings separately when the user has positions, since more columns are available. */
export const getMarketsColumnOptions = (beta: boolean) => ({
  [MarketRateType.Borrow]: createMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Borrow,
    beta,
  }),
  [MarketRateType.Supply]: createMarketsColumnOptions({
    hasPositions: true,
    onlyPositions: MarketRateType.Supply,
    beta,
  }),
  hasPositions: createMarketsColumnOptions({ hasPositions: true, beta }),
  noPositions: createMarketsColumnOptions({ hasPositions: false, beta }),
})
