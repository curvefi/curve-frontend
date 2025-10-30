import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { Column } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { getFlexAlignment, type TableItem } from './data-table.utils'
import { RotatableIcon } from './RotatableIcon'

export const Sortable = <T extends TableItem>({
  children,
  column,
  isEnabled = true,
}: {
  column: Column<T> | undefined
  children: ReactNode
  isEnabled?: boolean
}) => (
  <Stack
    direction="row"
    alignItems="end"
    {...(column && {
      justifyContent: getFlexAlignment(column),
      onClick: column.getToggleSortingHandler(),
    })}
    {...(isEnabled && { sx: { cursor: 'pointer', '&:hover': { color: `text.highlight` } } })}
  >
    {children}
    <RotatableIcon
      icon={ArrowDownIcon}
      rotated={column?.getIsSorted() === 'asc'}
      fontSize={column?.getIsSorted() ? 20 : 0}
      isEnabled={isEnabled}
    />
  </Stack>
)
