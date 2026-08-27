import { forwardRef, type ReactNode, type MouseEvent, type RefAttributes } from 'react'
import { ArrowDownIcon } from '@evm-ui/shared/icons/ArrowDownIcon'
import Stack from '@mui/material/Stack'
import type { Column, RowData } from '@tanstack/react-table'
import { type CurveTableFeatures, getFlexAlignment, type DataTableSize } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

type SortableProps<T extends RowData> = {
  column: Column<CurveTableFeatures, T, unknown> | undefined
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
const _Sortable = forwardRef<HTMLDivElement, SortableProps<RowData>>(function Sortable(
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
export const Sortable = _Sortable as <T extends RowData>(
  props: SortableProps<T> & RefAttributes<HTMLDivElement>,
) => ReactNode
