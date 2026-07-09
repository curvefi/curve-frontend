import { type RefObject } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import { FilterProps, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { TableFiltersOverlay } from '@ui-kit/shared/ui/DataTable/TableFiltersOverlay'
import type { QueryProp } from '@ui-kit/types/util'
import { LlamaMarketColumnId } from '../columns'
import { LlamaMarketsFilters } from './LlamaMarketsFilters'

type LlamaTableFiltersOverlayProps = {
  table: TanstackTable<LlamaMarket>
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: RefObject<HTMLDivElement | null>
  marketsQuery: QueryProp<LlamaMarket[]>
  resetFilters: () => void
  hasActiveFilters: boolean
} & FilterProps<LlamaMarketColumnId>

export const LlamaTableFiltersOverlay = ({
  table,
  open,
  setOpen,
  anchorRef,
  marketsQuery,
  resetFilters,
  hasActiveFilters,
  ...filterProps
}: LlamaTableFiltersOverlayProps) => (
  <TableFiltersOverlay
    anchorRef={anchorRef}
    drawerTestId="drawer-filter-menu-lamalend-markets"
    hasActiveFilters={hasActiveFilters}
    open={open}
    resetFilters={resetFilters}
    setOpen={setOpen}
    title={t`Filter markets`}
  >
    <LlamaMarketsFilters table={table} marketsQuery={marketsQuery} {...filterProps} />
  </TableFiltersOverlay>
)
