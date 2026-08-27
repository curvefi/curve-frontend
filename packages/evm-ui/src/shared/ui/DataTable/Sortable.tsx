import { forwardRef, type ReactNode, type MouseEvent } from 'react'
import { ArrowDownIcon } from '@evm-ui/shared/icons/ArrowDownIcon'
import Stack from '@mui/material/Stack'
import type { Column, ColumnMeta, RowData, StockFeatures } from '@tanstack/react-table'
import type { DataTableSize } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

type SortingFeatures = Pick<StockFeatures, 'rowSortingFeature'>
type SortableColumn = Pick<Column<SortingFeatures, RowData>, 'id' | 'getIsSorted' | 'getToggleSortingHandler'> & {
  columnDef: { meta?: Pick<ColumnMeta<SortingFeatures, RowData>, 'type'> }
}

type SortableProps = {
  column: SortableColumn | undefined
  children: ReactNode
  size: DataTableSize
  isEnabled?: boolean
}

const HeaderCellSortableAlign = {
  extraSmall: 'center',
  small: 'center',
  medium: 'end',
  large: 'end',
}

// forwardRef needed to pass ref to Tooltip for it to work
// eslint-disable-next-line @eslint-react/no-forward-ref -- Existing violation before enabling this rule.
export const Sortable = forwardRef<HTMLDivElement, SortableProps>(function Sortable(
  { children, column, size, isEnabled = true, ...props },
  ref,
) {
  return (
    <Stack
      ref={ref}
      {...props}
      direction="row"
      {...(column && {
        onClick: (e: MouseEvent) => {
          column.getToggleSortingHandler()?.(e)
          e.stopPropagation()
        },
      })}
      sx={{
        alignItems: HeaderCellSortableAlign[size],
        ...(isEnabled && { sx: { cursor: 'pointer' } }),
        ...(column && { justifyContent: column.columnDef.meta?.type === 'numeric' ? 'end' : 'start' }),
      }}
    >
      {children}
      <RotatableIcon
        icon={ArrowDownIcon}
        rotated={column?.getIsSorted() === 'asc'}
        fontSize={column?.getIsSorted() ? 20 : 0}
        isEnabled={isEnabled}
        {...(isEnabled && { testId: `icon-sort-${column?.id}-${column?.getIsSorted()}` })}
      />
    </Stack>
  )
})
