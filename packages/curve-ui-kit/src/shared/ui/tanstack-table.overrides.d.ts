import '@tanstack/table-core'
import type { RowData } from '@tanstack/table-core'
import type { TypographyVariantKey } from '../../themes/typography'

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

  interface TableMeta<TData extends RowData> {}
}
