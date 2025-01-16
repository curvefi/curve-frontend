import '@tanstack/react-table'
import { TypographyVariantKey } from '../../themes/typography'

/**
 * Extend the tanstack ColumnMeta interface to add our custom properties
 */
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: 'numeric'
    hidden?: boolean
    variant?: TypographyVariantKey
  }

  /** Tanstack only supports hiding the whole column, but we want to hide features inside the column */
  interface VisibilityTableState {
    featureVisibility: VisibilityState
  }
}
