import { forwardRef, type ReactNode, type MouseEvent, type RefAttributes } from 'react'
import Stack from '@mui/material/Stack'
import type { Column } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import {
  DataTableHeaderCellSortableAlign,
  getFlexAlignment,
  type DataTableSize,
  type TableItem,
} from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

interface SortableProps<T extends TableItem> {
  column: Column<T, unknown> | undefined
  children: ReactNode
  size: DataTableSize
  isEnabled?: boolean
}
// forwardRef needed to pass ref to Tooltip for it to work
const _Sortable = forwardRef<HTMLDivElement, SortableProps<TableItem>>(function Sortable(
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
        alignItems: DataTableHeaderCellSortableAlign[size],
        ...(isEnabled && { sx: { cursor: 'pointer' } }),
        ...(column && { justifyContent: getFlexAlignment(column) }),
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

/** Type assertion to support generics with forwardRef (forwardRef doesn't natively support generic components) */
export const Sortable = _Sortable as <T extends TableItem>(
  props: SortableProps<T> & RefAttributes<HTMLDivElement>,
) => ReactNode
