import '@tanstack/table-core'
import type { RowData } from '@tanstack/table-core'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'

/**
 * Extend the tanstack ColumnMeta interface to add our custom properties
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: 'numeric'
    hidden?: boolean // todo: get rid of this property, use column visibility, it breaks e.g. column.getIsLastColumn()
    variant?: TypographyVariantKey
    borderRight?: boolean
    hideZero?: boolean
  }

  interface TableMeta<TData extends RowData> {}
}
