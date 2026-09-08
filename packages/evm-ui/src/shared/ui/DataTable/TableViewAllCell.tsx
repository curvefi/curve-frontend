import { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TableCell, { TableCellProps } from '@mui/material/TableCell'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowDownIcon } from '@ui/icons/ArrowDownIcon'

const { Spacing } = SizesAndSpaces

export const TableViewAllCell = (
  {
    children,
    onClick,
    isLoading = false,
    ...tableCellProps
  }: {
    children: ReactNode
    onClick: () => void
    isLoading?: boolean
  } & TableCellProps, // constant padding block accross all breakpoints
) => (
  <TableCell {...tableCellProps} sx={{ paddingBlock: Spacing.xs }}>
    <Stack sx={{ alignSelf: 'center', alignItems: 'center' }}>
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
