import { type RefObject } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { FilterProps, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { TableFiltersOverlay } from '@ui-kit/shared/ui/DataTable/TableFiltersOverlay'
import type { QueryProp } from '@ui-kit/types/util'
import { MarketColumnId } from '../columns'
import { MarketsFilters } from './MarketsFilters'

type MarketsFiltersOverlayProps = {
  table: TanstackTable<LlamaMarket>
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
