import { type RefObject } from 'react'
import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@evm-ui/lib/i18n'
import { FilterProps, TanstackTable } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { TableFiltersOverlay } from '@evm-ui/shared/ui/DataTable/TableFiltersOverlay'
import type { QueryProp } from '@evm-ui/types/util'
import { MarketColumnId } from '../columns'
import { MarketsFilters } from './MarketsFilters'

type MarketsFiltersOverlayProps = {
  table: TanstackTable<LlamaMarketRow>
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: RefObject<HTMLDivElement | null>
  marketsQuery: QueryProp<LlamaMarket[]>
  resetFilters: () => void
  hasActiveFilters: boolean
} & FilterProps<MarketColumnId>

export const MarketsFiltersOverlay = ({
  table,
  open,
  setOpen,
  anchorRef,
  marketsQuery,
  resetFilters,
  hasActiveFilters,
  ...filterProps
}: MarketsFiltersOverlayProps) => (
  <TableFiltersOverlay
    anchorRef={anchorRef}
    drawerTestId="drawer-filter-menu-lamalend-markets"
    hasActiveFilters={hasActiveFilters}
    open={open}
    resetFilters={resetFilters}
    setOpen={setOpen}
    title={t`Filter markets`}
  >
    <MarketsFilters table={table} marketsQuery={marketsQuery} {...filterProps} />
  </TableFiltersOverlay>
)
