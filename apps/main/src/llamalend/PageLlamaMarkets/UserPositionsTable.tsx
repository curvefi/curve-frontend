import lodash from 'lodash'
import { useMemo, useState } from 'react'
import { MarketTypeFilterChips } from '@/llamalend/PageLlamaMarkets/chips/MarketTypeFilterChips'
import { LlamaMarketSort } from '@/llamalend/PageLlamaMarkets/LlamaMarketSort'
import Grid from '@mui/material/Grid'
import { ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsMobile, useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable, getTableModels } from '@ui-kit/shared/ui/DataTable'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../entities/llama-markets'
import { MarketsFilterChips } from './chips/MarketsFilterChips'
import { DEFAULT_SORT, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { maxMultiSortColCount } from './hooks/useLlamaMarketSortOptions'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const { isEqual } = lodash
const TITLES = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserPositions, value: type }], [type])

export type UserPositionsTableProps = {
  result: LlamaMarketsResult | undefined
  loading: boolean
}

export const UserPositionsTable = ({ result, loading, tab }: UserPositionsTableProps & { tab: MarketRateType }) => {
  const { markets: data = [], userPositions } = result ?? {}
  const defaultFilters = useDefaultUserFilter(tab)
  const title = TITLES[tab]
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters(title, defaultFilters)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT, 'userSort')
  const { columnSettings, columnVisibility, sortField } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const isMobile = useIsMobile()
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    autoResetPageIndex: false, // autoreset causing stack too deep issues when receiving new data
    state: { expanded, sorting, columnVisibility, columnFilters },
    onSortingChange,
    onExpandedChange,
    maxMultiSortColCount,
    ...getTableModels(result),
  })
  const filterProps = { columnFiltersById, setColumnFilter }

  const showChips = userPositions?.Lend[tab] && userPositions?.Mint[tab]
  return (
    <DataTable
      table={table}
      emptyText={t`No positions found`}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userPositions)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        title={title}
        loading={loading}
        visibilityGroups={columnSettings}
        searchText={searchText}
        onSearch={onSearch}
        chips={
          <MarketsFilterChips
            hasFilters={columnFilters.length > 0 && !isEqual(columnFilters, defaultFilters)}
            resetFilters={resetFilters}
          >
            <Grid container justifyContent="space-between" size={12}>
              {!isMobile && (
                <Grid size={showChips ? 6 : 12}>
                  <TableSearchField value={searchText} onChange={onSearch} />
                </Grid>
              )}
              {showChips && (
                <Grid size={6}>
                  <MarketTypeFilterChips {...filterProps} />
                </Grid>
              )}
            </Grid>
          </MarketsFilterChips>
        }
        sort={<LlamaMarketSort onSortingChange={onSortingChange} sortField={sortField} />}
      />
    </DataTable>
  )
}
