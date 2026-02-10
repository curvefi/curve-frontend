/* eslint-disable @typescript-eslint/no-unused-vars */
import '@tanstack/table-core'
import type { RowData } from '@tanstack/table-core'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import type { TooltipProps } from '../Tooltip'

/**
 * Extend the tanstack ColumnMeta interface to add our custom properties
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: 'numeric' // aligns cell content to the right
    hidden?: boolean // todo: get rid of this property, use column visibility, it breaks e.g. column.getIsLastColumn()
    variant?: TypographyVariantKey
    tooltip?: Omit<TooltipProps, 'children'>
  }

  interface TableMeta<TData extends RowData> {
    chainId?: string
    isLoading?: boolean // used for additinal loading states, like notional rates
  }
}
