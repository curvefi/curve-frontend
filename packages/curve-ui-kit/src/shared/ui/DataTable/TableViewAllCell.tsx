import { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TableCell, { TableCellProps } from '@mui/material/TableCell'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { Spacing } from '@ui-kit/themes/design/0_primitives'

export const TableViewAllCell = ({
  children,
  onClick,
  isLoading = false,
  ...tableCellProps
}: {
  children: ReactNode
  onClick: () => void
  isLoading?: boolean
} & TableCellProps) => (
  // constant padding block accross all breakpoints
  <TableCell {...tableCellProps} sx={{ paddingBlock: Spacing[200] }}>
    <Stack alignSelf="center" alignItems="center">
      <Button
        color="ghost"
        size="extraSmall"
        onClick={onClick}
        loading={isLoading}
        endIcon={<ArrowDownIcon fontSize="small" />}
      >
        {children}
      </Button>
    </Stack>
  </TableCell>
)
