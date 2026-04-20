import { useEffect, useMemo, useState } from 'react'
import { PositionsEmptyState } from '@/llamalend/constants'
import Stack from '@mui/material/Stack'
import { fromEntries } from '@primitives/objects.utils'
import { ExpandedState } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getInternalUrl, LEND_MARKET_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { getHiddenCount, getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { MarketRateType } from '@ui-kit/types/market'
import type { LlamaMarket, LlamaMarketsResult } from '../../queries/market-list/llama-markets'
import { LlamaChainFilterChips } from './chips/LlamaChainFilterChips'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS, LlamaMarketColumnId } from './columns'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'
import { UserPositionsEmptyState } from './UserPositionsEmptyState'
import { UserPositionSummary } from './UserPositionsSummary'

const searchKey = 'search-user' as const

const LOCAL_STORAGE_KEYS = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}

const DEFAULT_SORT = {
  [MarketRateType.Borrow]: DEFAULT_SORT_BORROW,
  [MarketRateType.Supply]: DEFAULT_SORT_SUPPLY,
}

const SORT_QUERY_FIELD = {
  [MarketRateType.Borrow]: 'userSortBorrow',
  [MarketRateType.Supply]: 'userSortSupply',
}

/** This hook for tabs inside the datatable is temporary, we want to get rid of the tabs altogether */
const useTabs = (results: LlamaMarketsResult | undefined) => {
  const { markets = [], userHasPositions } = results ?? {}

  // Calculate total positions number across all markets (independent of filters)
  const openPositionsCount = useMemo(
    (): Record<MarketRateType, string | undefined> =>
      fromEntries(
        Object.values(MarketRateType).map((type) => [
          type,
          markets && `${markets.filter((market) => market.userHasPositions?.[type]).length}`,
        ]),
      ),
    [markets],
  )

  // Define tabs with position counts
  const tabs: TabOption<MarketRateType>[] = useMemo(
    () => [
      {
        value: MarketRateType.Borrow,
        label: t`Borrowing`,
        suffix: openPositionsCount[MarketRateType.Borrow],
      },
      {
        value: MarketRateType.Supply,
        label: t`Lending`,
        suffix: openPositionsCount[MarketRateType.Supply],
      },
    ],
    [openPositionsCount],
  )

  // Show the first tab that has user positions by default, or the first tab if none are found
  const defaultTab = useMemo(
    () => tabs.find(({ value }) => userHasPositions?.Lend[value] || userHasPositions?.Mint[value]) ?? tabs[0],
    [userHasPositions, tabs],
  )
  const [tab, setTab] = useState<MarketRateType>(defaultTab.value)

  // Update tab when defaultTab changes (e.g., when user positions data loads)
  useEffect(() => {
    setTab(defaultTab.value)
  }, [defaultTab.value])

  return [tab, setTab, tabs] as const
}

const getEmptyState = (isError: boolean, hasPositions: boolean): PositionsEmptyState =>
  isError ? PositionsEmptyState.Error : hasPositions ? PositionsEmptyState.Filtered : PositionsEmptyState.NoPositions

const buildVaultUrl = (market: LlamaMarket) =>
  getInternalUrl(
    'lend',
    market.chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${market.controllerAddress}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
  )

export type UserPositionsTableProps = {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
}

const pagination = { pageIndex: 0, pageSize: 50 }
const DEFAULT_VISIBLE_ROWS = 3

export const UserPositionsTable = ({ onReload, result, loading, isError }: UserPositionsTableProps) => {
  const { markets = [], userHasPositions } = result ?? {}
  const [tab, setTab, tabs] = useTabs(result)

  const userData = useMemo(
    () =>
      markets
        .filter((market) => market.userHasPositions?.[tab])
        .map((market) =>
          // For supply positions, navigate to vault page instead of borrow page
          tab === MarketRateType.Supply ? { ...market, url: buildVaultUrl(market) } : market,
        ),
    [markets, tab],
  )

  const title = LOCAL_STORAGE_KEYS[tab]

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    { columns: LlamaMarketColumnId, scope: tab.toLowerCase(), searchKey },
  )
  const globalFilterFn = useLlamaGlobalFilterFn(userData, globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], SORT_QUERY_FIELD[tab])
  const { columnSettings, columnVisibility, sortField, toggleVisibility } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }
  const selectedChains = columnFiltersById[LlamaMarketColumnId.Chain]

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data: userData,
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    globalFilterFn,
    ...getTableOptions(result),
  })
  return (
    <DataTable
      table={table}
      rowLimit={DEFAULT_VISIBLE_ROWS}
      viewAllLabel="View all positions"
      emptyState={
        <UserPositionsEmptyState
          state={getEmptyState(isError, userData.length > 0)}
          table={table}
          tab={tab}
          onReload={onReload}
          resetFilters={resetFilters}
        />
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={loading}
    >
      <Stack>
        <TableFilters<LlamaMarketColumnId>
          filterExpandedKey={title}
          loading={loading}
          onReload={onReload}
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          hasSearchBar
          disableSearchAutoFocus
          searchText={globalFilter}
          onSearch={setGlobalFilter}
          leftChildren={<TableFiltersTitles title={t`Your Positions`} />}
          collapsible={<LendingMarketsFilters data={userData} {...filterProps} />}
          chips={
            <>
              <LlamaChainFilterChips data={userData} {...filterProps} />
              <LlamaListChips
                hiddenCount={getHiddenCount(table)}
                resetFilters={resetFilters}
                onSortingChange={onSortingChange}
                sortField={sortField}
                data={userData}
                userPositionsTab={tab}
                {...filterProps}
              />
            </>
          }
        />
        <UserPositionSummary markets={markets} tab={tab} selectedChains={selectedChains} />
        <Stack
          direction="row"
          justifyContent="space-between"
          // needed for the bottom border to be the same height as the tabs
          alignItems="stretch"
          sx={{
            backgroundColor: (t) => t.design.Layer[1].Fill,
            flexGrow: 1,
            borderBottom: (t) => `1px solid ${t.design.Tabs.UnderLined.Default.Outline}`,
          }}
        >
          <TabsSwitcher value={tab} onChange={setTab} variant="underlined" options={tabs} overflow="standard" />
        </Stack>
      </Stack>
    </DataTable>
  )
}
