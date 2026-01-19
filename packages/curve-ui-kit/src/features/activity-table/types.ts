import type { ReactNode } from 'react'
import type { Chain, Address } from '@curvefi/prices-api'
import type { LlammaEvent, LlammaTrade } from '@curvefi/prices-api/llamma'
import type { AllPoolTrade, PoolLiquidityEvent } from '@curvefi/prices-api/pools'
import type { ColumnDef, Row, Table, VisibilityState } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'

// ============================================================================
// Common Types
// ============================================================================

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

// ============================================================================
// LLAMMA Types (for lending/crvusd markets)
// ============================================================================

export type LlammaTradeRow = LlammaTrade & { url?: string; network: Chain }
export type LlammaEventRow = LlammaEvent & {
  url?: string
  network: Chain
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}
export type LlammaActivitySelection = 'trades' | 'events'

// ============================================================================
// Pool Types (for DEX pools)
// ============================================================================

export type PoolTradeRow = AllPoolTrade & { url?: string; network: Chain }
export type PoolLiquidityRow = PoolLiquidityEvent & { url?: string; network: Chain }
export type PoolActivitySelection = 'trades' | 'liquidity'

/**
 * Configuration for a single table view within the ActivityTable.
 * Each selection can have its own data, columns, and loading state.
 */
export type ActivityTableConfig<TData extends TableItem> = {
  /** The data to display in the table */
  data: TData[]
  /** Column definitions for the table */
  columns: ColumnDef<TData, unknown>[]
  /** Whether the data is currently loading */
  isLoading: boolean
  /** Whether there was an error loading the data */
  isError?: boolean
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
  /** Callback when page changes for API-side pagination */
  onPageChange?: (pageIndex: number) => void
}

/**
 * Panel component rendered when a row is expanded on mobile.
 */
export type ExpandedPanel<TData extends TableItem> = (props: { row: Row<TData>; table: Table<TData> }) => ReactNode

/**
 * Props for the ActivityTable component.
 */
export type ActivityTableProps<TKey extends string, TData extends TableItem> = {
  /** Available selection options for the toggle buttons */
  selections: ActivitySelection<TKey>[]
  /** Currently active selection key */
  activeSelection: TKey
  /** Callback when the selection changes */
  onSelectionChange: (key: TKey) => void
  /** Configuration for the currently active table view */
  tableConfig: ActivityTableConfig<TData>
  /** Maximum height of the table (enables scrolling) */
  maxHeight?: `${number}rem`
  /** Optional panel to show when a row is expanded on mobile */
  expandedPanel?: ExpandedPanel<TData>
}
