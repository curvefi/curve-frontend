import { forwardRef, type ReactNode, type MouseEvent, type RefAttributes } from 'react'
import Stack from '@mui/material/Stack'
import type { Column } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { getFlexAlignment, type TableItem } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

type SortableProps<T extends TableItem> = {
  column: Column<T, unknown> | undefined
  children: ReactNode
  isEnabled?: boolean
}
// forwardRef needed to pass ref to Tooltip for it to work
const _Sortable = forwardRef<HTMLDivElement, SortableProps<TableItem>>(function Sortable(
  { children, column, isEnabled = true, ...props },
  ref,
) {
  return (
    <Stack
      ref={ref}
      {...props}
      direction="row"
      alignItems="end"
      {...(column && {
        justifyContent: getFlexAlignment(column),
        onClick: (e: MouseEvent) => {
          column.getToggleSortingHandler()?.(e)
          e.stopPropagation()
        },
      })}
      {...(isEnabled && { sx: { cursor: 'pointer', '&:hover': { color: `text.highlight` } } })}
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
