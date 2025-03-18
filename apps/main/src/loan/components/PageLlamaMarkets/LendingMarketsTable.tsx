import { useCallback } from 'react'
import {
  DEFAULT_SORT,
  LLAMA_MARKET_COLUMNS,
  useDefaultMarketColumnsVisibility,
} from '@/loan/components/PageLlamaMarkets/columns'
import { LlamaMarketColumnId } from '@/loan/components/PageLlamaMarkets/columns.enum'
import { LendingMarketsFilters } from '@/loan/components/PageLlamaMarkets/LendingMarketsFilters'
import { MarketsFilterChips } from '@/loan/components/PageLlamaMarkets/MarketsFilterChips'
import { type LlamaMarketsResult } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { useSortFromQueryString } from '@ui-kit/hooks/useSortFromQueryString'
import { t } from '@ui-kit/lib/i18n'
import { DataTable } from '@ui-kit/shared/ui/DataTable'
import { TableFilters, useColumnFilters } from '@ui-kit/shared/ui/DataTable/TableFilters'
import { useVisibilitySettings } from '@ui-kit/shared/ui/DataTable/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth, Sizing } = SizesAndSpaces

// todo: rename to LlamaMarketsTable
export const LendingMarketsTable = ({
  onReload,
  result,
  headerHeight,
  isError,
}: {
  onReload: () => void
  result: LlamaMarketsResult | undefined
  headerHeight: string
  isError: boolean
}) => {
  const { signerAddress } = useWallet()
  const [columnFilters, columnFiltersById, setColumnFilter, resetFilters] = useColumnFilters()
  const defaultVisibility = useDefaultMarketColumnsVisibility(signerAddress)
  const { columnSettings, columnVisibility, toggleVisibility } = useVisibilitySettings(defaultVisibility)

  const [sorting, onSortingChange] = useSortFromQueryString(DEFAULT_SORT)
  const data = result?.markets ?? []
  const table = useReactTable({
    columns: LLAMA_MARKET_COLUMNS,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnVisibility, columnFilters },
    onSortingChange,
    maxMultiSortColCount: 3, // allow 3 columns to be sorted at once while holding shift
  })

  return (
    <Stack
      sx={{
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
      }}
    >
      <DataTable
        table={table}
        headerHeight={headerHeight}
        rowSx={{ height: { ...Sizing['3xl'], mobile: 77 } }} // the 3xl is too small in mobile (64px)
        emptyText={isError ? t`Could not load markets` : t`No markets found`}
      >
        <TableFilters
          title={t`Llamalend Markets`}
          subtitle={t`Select a market to view more details`}
          onReload={onReload}
          learnMoreUrl="https://docs.curve.fi/lending/overview/"
          visibilityGroups={columnSettings}
          toggleVisibility={toggleVisibility}
          onSearch={useCallback(
            (search: string) => setColumnFilter(LlamaMarketColumnId.Assets, search || undefined),
            [setColumnFilter],
          )}
          collapsible={
            <LendingMarketsFilters columnFilters={columnFiltersById} setColumnFilter={setColumnFilter} data={data} />
          }
        >
          <MarketsFilterChips
            columnFiltersById={columnFiltersById}
            setColumnFilter={setColumnFilter}
            hasFilters={columnFilters.length > 0}
            hasPositions={result?.hasPositions}
            hasFavorites={result?.hasFavorites}
            resetFilters={resetFilters}
          />
        </TableFilters>
      </DataTable>
    </Stack>
  )
}
