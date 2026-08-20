/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/consistent-type-definitions */
import '@tanstack/table-core'
import type { TypographyVariantKey } from '@evm-ui/themes/typography'
import { Unit } from '@evm-ui/utils/units'
import type { RowData } from '@tanstack/table-core'
import type { TooltipProps } from '../Tooltip'

/**
 * Extend the tanstack ColumnMeta interface to add our custom properties
 */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: 'numeric' // aligns cell content to the right
    unit?: Unit // used when displaying the filter's serialized value
    hidden?: boolean // todo: get rid of this property, use column visibility, it breaks e.g. column.getIsLastColumn()
    variant?: TypographyVariantKey
    tooltip?: Omit<TooltipProps, 'children'>
  }
}
