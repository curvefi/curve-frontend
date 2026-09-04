import type { IncreasingLengthCategory } from '@evm-ui/hooks/useIncreasingLength'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { EmptyStateCardProps } from '../EmptyStateCard'
import type { DataTableSize } from './data-table.utils'
import { EmptyStateRowSize } from './EmptyStateRow'

const { Height } = SizesAndSpaces

export type DataTableCategoryConfig = {
  size?: DataTableSize
  height?: `${number}rem` // also sets overflowY to 'auto'
  defaultVisibleRows?: number // maximum number of visible rows
  disableStickyHeader?: boolean // can also be disabled by limited rows or table width overflow.
  hideHeader?: boolean
  increasingLength?: IncreasingLengthCategory
  emptyStateSize?: NonNullable<EmptyStateCardProps['size']>
  emptyStateRowSize?: EmptyStateRowSize
}

export type DataTableCategory = keyof typeof DATA_TABLE_CATEGORIES

export const DATA_TABLE_CATEGORIES = {
  // default full-list table, e.g. MarketsTable or PoolListTable.
  list: {
    emptyStateRowSize: 'lg',
  },
  // preview table that starts with a few rows, e.g. UserPositionsMarketRateTable.
  limited: {
    defaultVisibleRows: 3,
    increasingLength: 'limited',
    emptyStateSize: 'sm',
  },
  // table with many rows constrained inside a scrollable viewport, e.g. ActivityTable or UserEventsTable.
  scrollable: {
    height: Height.table.events,
    emptyStateRowSize: 'lg',
  },
  // compact detail table inside a secondary card or advanced-details section, e.g. PoolComposition or YieldBreakdown.
  detail: {
    disableStickyHeader: true,
    increasingLength: 'disabled',
  },
  // compact form table without visible column headers, e.g. ClaimTab or ClosePositionForm.
  form: {
    disableStickyHeader: true,
    hideHeader: true,
    increasingLength: 'limited',
    emptyStateSize: 'sm',
  },
} as const satisfies Record<string, DataTableCategoryConfig>
