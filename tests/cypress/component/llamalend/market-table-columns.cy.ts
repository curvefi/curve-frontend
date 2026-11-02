import { BORROW_TABLE } from '@/llamalend/features/market-list/columns/borrow.table'
import { MarketColumnId } from '@/llamalend/features/market-list/columns/columns.enum'
import { getColumnVisibility } from '@/llamalend/features/market-list/columns/market-table'
import { MARKETS_TABLE } from '@/llamalend/features/market-list/columns/markets.table'
import { SUPPLY_TABLE } from '@/llamalend/features/market-list/columns/supply.table'
import { recordValues } from '@primitives/objects.utils'
import { getSortableColumnIds } from '@ui/hooks/useSortFromQueryString'

const FILTER_COLUMNS = [
  MarketColumnId.Chain,
  MarketColumnId.CollateralSymbol,
  MarketColumnId.BorrowedSymbol,
  MarketColumnId.IsFavorite,
  MarketColumnId.Rewards,
  MarketColumnId.DeprecatedMessage,
  MarketColumnId.Type,
  MarketColumnId.Version,
]

const USER_COLUMNS = Object.entries(MarketColumnId)
  .filter(([key]) => key.startsWith('User'))
  .map(([, id]) => id as string)

const visibleColumns = (columns: Parameters<typeof getColumnVisibility>[0]) =>
  Object.entries(getColumnVisibility(columns, {}))
    .filter(([, visible]) => visible)
    .map(([id]) => id)

describe('filter columns', () => {
  it('have no header on the market list', () =>
    expect(MARKETS_TABLE.columns.filter(({ header }) => !header).map(({ id }) => id)).to.deep.equal(FILTER_COLUMNS))

  it('are not on the position tables', () =>
    expect(
      [...BORROW_TABLE.columns, ...SUPPLY_TABLE.columns].filter(({ id }) =>
        FILTER_COLUMNS.includes(id as MarketColumnId),
      ),
    ).to.deep.equal([]))

  it('accepted in the URL are the columns the market list can filter', () =>
    expect(recordValues(MARKETS_TABLE.filterColumns)).to.have.members([
      ...FILTER_COLUMNS,
      MarketColumnId.BorrowRate,
      MarketColumnId.MaxLtv,
      MarketColumnId.UtilizationPercent,
      MarketColumnId.LiquidityUsd,
      MarketColumnId.Tvl,
    ]))
})

describe('market list', () => {
  it('has no user position columns', () =>
    expect(MARKETS_TABLE.columns.filter(({ id }) => USER_COLUMNS.includes(id))).to.deep.equal([]))

  it('gives every switch a group', () =>
    expect(
      [...MARKETS_TABLE.columns, ...BORROW_TABLE.columns, ...SUPPLY_TABLE.columns].filter(
        ({ header, enableHiding, meta }) => header && enableHiding !== false && !meta?.settingsGroup,
      ),
    ).to.deep.equal([]))
})

describe('default visible columns', () => {
  it('on the market list', () =>
    expect(visibleColumns(MARKETS_TABLE.columns)).to.deep.equal([
      MarketColumnId.Assets,
      MarketColumnId.BorrowRate,
      MarketColumnId.SupplyRate,
      MarketColumnId.MaxLeverage,
      MarketColumnId.UtilizationPercent,
      MarketColumnId.LiquidityUsd,
      MarketColumnId.Tvl,
    ]))

  it('on the borrow table', () =>
    expect(visibleColumns(BORROW_TABLE.columns)).to.deep.equal([
      MarketColumnId.Assets,
      MarketColumnId.UserBorrowed,
      MarketColumnId.UserCollateral,
      MarketColumnId.BorrowRate,
      MarketColumnId.UserLtv,
      MarketColumnId.UserEquity,
      MarketColumnId.UserPnl,
      MarketColumnId.UserHealth,
    ]))

  it('on the supply table', () =>
    expect(visibleColumns(SUPPLY_TABLE.columns)).to.deep.equal([
      MarketColumnId.Assets,
      MarketColumnId.UserDeposited,
      MarketColumnId.UserBoostMultiplier,
      MarketColumnId.SupplyRate,
    ]))
})

describe('sortable columns', () => {
  it('on the market list are the shown columns that can sort', () =>
    expect([...getSortableColumnIds(MARKETS_TABLE.columns)]).to.deep.equal([
      MarketColumnId.BorrowRate,
      MarketColumnId.NetBorrowRate,
      MarketColumnId.CollateralYield,
      MarketColumnId.SupplyRate,
      MarketColumnId.NetSupplyRate,
      MarketColumnId.MaxLeverage,
      MarketColumnId.MaxReturnOnEquity,
      MarketColumnId.MaxLtv,
      MarketColumnId.UtilizationPercent,
      MarketColumnId.SolvencyPercent,
      MarketColumnId.LiquidityUsd,
      MarketColumnId.TotalDebt,
      MarketColumnId.TotalCollateralUsd,
      MarketColumnId.Tvl,
    ]))

  it('on the borrow table are its columns without the market title', () =>
    expect([...getSortableColumnIds(BORROW_TABLE.columns)]).to.deep.equal([
      MarketColumnId.UserBorrowed,
      MarketColumnId.UserCollateral,
      MarketColumnId.BorrowRate,
      MarketColumnId.UserLtv,
      MarketColumnId.UserEquity,
      MarketColumnId.UserPnl,
      MarketColumnId.UserHealth,
    ]))

  it('on the supply table are its columns without the market title', () =>
    expect([...getSortableColumnIds(SUPPLY_TABLE.columns)]).to.deep.equal([
      MarketColumnId.UserDeposited,
      MarketColumnId.UserBoostMultiplier,
      MarketColumnId.SupplyRate,
    ]))
})
