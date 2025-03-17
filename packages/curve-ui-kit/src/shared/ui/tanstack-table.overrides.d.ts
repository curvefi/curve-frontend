import '@tanstack/react-table'
import '@tanstack/table-core'
import type { RowData } from '@tanstack/table-core/src/types'
import { TypographyVariantKey } from '../../themes/typography'

/**
 * Extend the tanstack ColumnMeta interface to add our custom properties
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: 'numeric'
    hidden?: boolean
    variant?: TypographyVariantKey
    borderRight?: boolean
    hideZero?: boolean
  }

  export interface TableMeta<TData extends RowData> {
    setColumnFilter(id: string, value: unknown): void
  }
}
