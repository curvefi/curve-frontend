import { useMemo, useState } from 'react'
import { LlamaListMarketChips } from '@/llamalend/features/market-list/chips/LlamaListMarketChips'
import Grid from '@mui/material/Grid'
import { ExpandedState, useReactTable } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useColumnFilters } from '@ui-kit/shared/ui/DataTable/hooks/useColumnFilters'
import { TableFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { TableFiltersTitles } from '@ui-kit/shared/ui/DataTable/TableFiltersTitles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { type LlamaMarketsResult } from '../../entities/llama-markets'
import { DEFAULT_SORT_BORROW, DEFAULT_SORT_SUPPLY, LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns.enum'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { useSearch } from './hooks/useSearch'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const { Spacing } = SizesAndSpaces

const LOCAL_STORAGE_KEYS = {
  // not using the t`` here as the value is used as a key in the local storage
  [MarketRateType.Borrow]: 'My Borrow Positions',
  [MarketRateType.Supply]: 'My Supply Positions',
}

const DEFAULT_SORT = {
  [MarketRateType.Borrow]: DEFAULT_SORT_BORROW,
  [MarketRateType.Supply]: DEFAULT_SORT_SUPPLY,
}

const useDefaultUserFilter = (type: MarketRateType) =>
  useMemo(() => [{ id: LlamaMarketColumnId.UserHasPositions, value: type }], [type])

export type UserPositionsTableProps = {
  result: LlamaMarketsResult | undefined
  loading: boolean
  tab: MarketRateType
}

const pagination = { pageIndex: 0, pageSize: 50 }

export const UserPositionsTable = ({ result, loading, tab }: UserPositionsTableProps) => {
  const { markets: data = [], userHasPositions } = result ?? {}
  const defaultFilters = useDefaultUserFilter(tab)
  const title = LOCAL_STORAGE_KEYS[tab]
  const { columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useColumnFilters({
    title,
    columns: LlamaMarketColumnId,
    defaultFilters,
    scope: tab.toLowerCase(),
  })
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT[tab], 'userSort')
  const { columnSettings, columnVisibility, sortField } = useLlamaTableVisibility(title, sorting, tab)
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const [searchText, onSearch] = useSearch(columnFiltersById, setColumnFilter)
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility, columnFilters },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    ...getTableOptions(result),
  })

  const showChips = userHasPositions?.Lend[tab] && userHasPositions?.Mint[tab]
  return (
    <DataTable
      table={table}
      emptyState={<EmptyStateRow size="sm" table={table}>{t`No positions found`}</EmptyStateRow>}
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={loading}
    >
      <TableFilters<LlamaMarketColumnId>
        filterExpandedKey={title}
        leftChildren={<TableFiltersTitles title={t`${title}`} />}
        loading={loading}
        hasSearchBar
        visibilityGroups={columnSettings}
        searchText={searchText}
        onSearch={onSearch}
        chips={
          showChips && (
            <Grid container size={12} spacing={Spacing.sm}>
              <LlamaListMarketChips columnFiltersById={columnFiltersById} setColumnFilter={setColumnFilter} />
            </Grid>
          )
        }
      />
    </DataTable>
  )
}
