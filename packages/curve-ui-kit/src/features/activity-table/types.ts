import type { Chain, Address } from '@curvefi/prices-api'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { ColumnDef, VisibilityState } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'

export type Token = {
  symbol: string
  address: Address
}

/**
 * Selection option for the activity table toggle buttons.
 */
export type ActivitySelection<TKey extends string = string> = {
  key: TKey
  label: string
}

// LLAMMA Types (for lending/crvusd markets)
export type LlammaTradeRow = LlammaTrade & { txUrl?: string; url?: never; network: Chain }
export type LlammaEventRow = LlammaEvent & {
  txUrl?: string
  url?: never
  network: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}
export type LlammaActivitySelection = 'trades' | 'events'

// Pool Types (for DEX pools)
export type PoolTradeRow = AllPoolTrade & { txUrl?: string; url?: never; network: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & {
  txUrl?: string
  url?: never
  network: Chain
  poolTokens: Token[]
}
export type PoolActivitySelection = 'trades' | 'liquidity'

/**
 * Configuration for a single table view within the ActivityTable.
 * Each selection can have its own data, columns, and loading state.
 */
export type ActivityTableConfig<TData extends TableItem> = {
  data: TData[] | undefined
  columns: ColumnDef<TData>[]
  isLoading: boolean
  isError: boolean
  /** Custom message to show when the table is empty */
  emptyMessage?: string
  /** Column visibility state for responsive hiding of columns */
  columnVisibility?: VisibilityState
  /** Total row count for API-side pagination */
  totalRows?: number
  /** Current page index (0-based) for API-side pagination */
  pageIndex?: number
  /** Page size for API-side pagination */
  pageSize?: number
  /** Total available pages for API-side pagination */
  pageCount?: number
  /** Callback when page changes for API-side pagination */
  onPageChange?: (pageIndex: number) => void
}

/**
 * Props for the ActivityTable component.
 */
export type ActivityTableProps<TKey extends string, TData extends TableItem> = {
  /** Available selection options for the toggle buttons */
  selections: ActivitySelection<TKey>[]
  activeSelection: TKey
  /** Callback when the selection changes */
  onSelectionChange: (key: TKey) => void
  tableConfig: ActivityTableConfig<TData>
  /** Maximum height of the table (enables scrolling) */
  maxHeight?: `${number}rem`
  /** Optional panel to show when a row is expanded on mobile */
  expandedPanel?: ExpandedPanel<TData>
}
