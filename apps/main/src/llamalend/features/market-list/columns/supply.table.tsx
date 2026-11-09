import { formatNetSupplyRate } from '@/llamalend/llama.utils'
import { SupplyIncentivesTooltipContent } from '@/llamalend/widgets/tooltips/SupplyIncentivesTooltipContent'
import { MarketRateType } from '@evm-ui/types/market'
import { t } from '@ui/lib/i18n'
import { BoostCell } from '../cells/BoostCell'
import { PercentCell } from '../cells/PercentCell'
import { PriceCell } from '../cells/PriceCell'
import { RateCell } from '../cells/RateCell/RateCell'
import { UserSupplyRateTooltip } from '../cells/RateCell/SupplyRateLendTooltip'
import { getUserIncentivesApr, getUserSupplyShare, getUserSupplyTotalApy } from '../user-position.utils'
import { MARKET_TITLES } from './column.titles'
import { MarketColumnId } from './columns.enum'
import { adapt, defineMarketTable, inGroup } from './market-table'
import {
  assetsColumn,
  columnHelper,
  liquidityUsdColumn,
  type MarketTable,
  solvencyColumn,
  supplyRateColumn,
  utilizationColumn,
} from './shared.columns'

const userDepositedColumn = columnHelper.accessor('lendingPosition.supplied', {
  id: MarketColumnId.UserDeposited,
  header: MARKET_TITLES[MarketColumnId.UserDeposited],
  cell: PriceCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const userBoostColumn = columnHelper.accessor('lendingPosition.boostMultiplier', {
  id: MarketColumnId.UserBoostMultiplier,
  header: MARKET_TITLES[MarketColumnId.UserBoostMultiplier],
  cell: BoostCell,
  meta: { type: 'numeric' },
  sortUndefined: 'last',
})

const SUPPLY_TABLE_OPTIONS = {
  testId: 'supply',
  defaultSort: [{ id: MarketColumnId.UserDeposited, desc: true }],
  sortQueryField: 'userSortSupply',
}

export const LEGACY_SUPPLY_TABLE: MarketTable = defineMarketTable({
  ...SUPPLY_TABLE_OPTIONS,
  storageKey: 'my-supply-positions',
  deprecatedVariants: [MarketRateType.Supply], // used for the v9 -> v10 migration, this will be removed in the future
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Supply`, [userDepositedColumn, userBoostColumn, supplyRateColumn]),
  ]),
})

export const SUPPLY_TABLE: MarketTable = defineMarketTable({
  ...SUPPLY_TABLE_OPTIONS,
  storageKey: 'user-supply-positions',
  deprecatedVariants: [],
  columns: columnHelper.columns([
    assetsColumn,
    ...inGroup(t`Supply`, [
      userDepositedColumn,
      userBoostColumn,
      adapt(supplyRateColumn, {
        // The total APY below the rate and the tooltip include the boost of the user
        cell: props => (
          <RateCell
            {...props}
            getSubRate={market => formatNetSupplyRate(getUserSupplyTotalApy(market))}
            Tooltip={UserSupplyRateTooltip}
          />
        ),
      }),
      columnHelper.accessor(getUserSupplyShare, {
        id: MarketColumnId.UserSupplyShare,
        header: MARKET_TITLES[MarketColumnId.UserSupplyShare],
        cell: PercentCell,
        meta: { type: 'numeric', unit: 'percentage', defaultHidden: true },
        sortUndefined: 'last',
      }),
      columnHelper.accessor(getUserIncentivesApr, {
        id: MarketColumnId.SupplyIncentivesApr,
        header: MARKET_TITLES[MarketColumnId.SupplyIncentivesApr],
        cell: PercentCell,
        meta: {
          type: 'numeric',
          unit: 'percentage',
          tooltip: {
            title: MARKET_TITLES[MarketColumnId.SupplyIncentivesApr],
            body: <SupplyIncentivesTooltipContent />,
          },
          defaultHidden: true,
        },
        sortUndefined: 'last',
      }),
      adapt(liquidityUsdColumn, { meta: { defaultHidden: true } }),
      adapt(utilizationColumn, { meta: { defaultHidden: true } }),
      solvencyColumn,
    ]),
  ]),
})
