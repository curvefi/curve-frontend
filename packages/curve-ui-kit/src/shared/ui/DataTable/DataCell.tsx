import Typography from '@mui/material/Typography'
import { type Cell, flexRender } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, type TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

/**
 * DataCell component to render the data cell in the table.
 */
export const DataCell = <T extends TableItem>({ cell }: { cell: Cell<T, unknown> }) => {
  const column = cell.column
  const { hidden, variant, borderRight } = column.columnDef.meta ?? {}
  return (
    !hidden && (
      <Typography
        variant={variant ?? 'tableCellMBold'}
        color="text.primary"
        component="td"
        sx={{
          textAlign: getAlignment(column),
          paddingInline: Spacing.sm,
          paddingBlock: Spacing.xs, // `md` removed, content should be vertically centered
          ...getExtraColumnPadding(column),
          ...(borderRight && { borderRight: (t) => `1px solid ${t.design.Layer[1].Outline}` }),
        }}
        data-testid={`data-table-cell-${column.id}`}
      >
        {flexRender(column.columnDef.cell, cell.getContext())}
      </Typography>
    )
  )
}
