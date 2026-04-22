import { useMemo, useState } from 'react'
import type { LlamaMarketsResult } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import { ExpandedState } from '@tanstack/react-table'
import { useIsTablet } from '@ui-kit/hooks/useBreakpoints'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { getHiddenCount, getTableOptions, useTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { useFilters } from '@ui-kit/shared/ui/DataTable/hooks/useFilters'
import { NewDataTable } from '@ui-kit/shared/ui/DataTable/NewDataTable'
import { NewTableFilters } from '@ui-kit/shared/ui/DataTable/NewTableFilters'
import { NewTableFiltersHeader } from '@ui-kit/shared/ui/DataTable/NewTableFiltersHeader'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'
import { LlamaChainFilterChips } from './chips/LlamaChainFilterChips'
import { LlamaListChips } from './chips/LlamaListChips'
import { DEFAULT_SORT } from './columns'
import { LLAMA_MARKET_COLUMNS } from './columns'
import { LlamaMarketColumnId } from './columns'
import { useLlamaGlobalFilterFn } from './filters/llamaGlobalFilter'
import { useLlamaTableVisibility } from './hooks/useLlamaTableVisibility'
import { LendingMarketsFilters } from './LendingMarketsFilters'
import { LlamaMarketExpandedPanel } from './LlamaMarketExpandedPanel'

const LOCAL_STORAGE_KEY = 'Llamalend Markets'

const pagination = { pageIndex: 0, pageSize: 200 }

export const NewLlamaMarketsTable = ({
  onReload,
  result,
  isError,
  loading,
}: {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  isError: boolean
  loading: boolean
}) => {
  const { markets, userHasPositions, hasFavorites } = result ?? {}
  const data = useMemo(() => markets ?? [], [markets])

  const { globalFilter, setGlobalFilter, columnFilters, columnFiltersById, setColumnFilter, resetFilters } = useFilters(
    { columns: LlamaMarketColumnId },
  )
  const globalFilterFn = useLlamaGlobalFilterFn(data, globalFilter)
  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const { columnSettings, columnVisibility, toggleVisibility, sortField } = useLlamaTableVisibility(
    LOCAL_STORAGE_KEY,
    sorting,
    userHasPositions,
  )
  const [expanded, onExpandedChange] = useState<ExpandedState>({})
  const filterProps = { columnFiltersById, setColumnFilter }

  const table = useTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    state: { expanded, sorting, columnVisibility, columnFilters, globalFilter },
    initialState: { pagination },
    onSortingChange,
    onExpandedChange,
    globalFilterFn,
    ...getTableOptions(result),
  })

  return (
    <NewDataTable
      table={table}
      emptyState={
        <EmptyStateRow table={table}>
          <EmptyStateCard
            title={isError ? t`Could not load markets` : t`No markets found`}
            subtitle={isError ? undefined : t`Try adjusting your filters or search query`}
            action={
              <Button size="small" onClick={isError ? onReload : resetFilters}>
                {isError ? t`Reload` : t`Show All Markets`}
              </Button>
            }
          />
        </EmptyStateRow>
      }
      expandedPanel={LlamaMarketExpandedPanel}
      shouldStickFirstColumn={Boolean(useIsTablet() && userHasPositions)}
      loading={loading}
    >
      <NewTableFilters<LlamaMarketColumnId>
        filterExpandedKey={LOCAL_STORAGE_KEY}
        loading={loading}
        onReload={onReload}
        visibilityGroups={columnSettings}
        toggleVisibility={toggleVisibility}
        hasSearchBar
        disableSearchAutoFocus
        searchText={globalFilter}
        onSearch={setGlobalFilter}
        header={<NewTableFiltersHeader title={t`Markets`} />}
        collapsible={<LendingMarketsFilters data={data} {...filterProps} />}
        chips={
          <>
            <LlamaChainFilterChips data={data} {...filterProps} />
            <LlamaListChips
              hiddenCount={getHiddenCount(table)}
              resetFilters={resetFilters}
              hasFavorites={hasFavorites}
              onSortingChange={onSortingChange}
              sortField={sortField}
              data={data}
              {...filterProps}
            />
          </>
        }
      />
    </NewDataTable>
  )
}
