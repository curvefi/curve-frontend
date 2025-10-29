import Typography from '@mui/material/Typography'
import { flexRender, type Header } from '@tanstack/react-table'
import { Sortable } from '@ui-kit/shared/ui/DataTable/Sortable'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Tooltip } from '../Tooltip'
import { getAlignment, getExtraColumnPadding, type TableItem } from './data-table.utils'

const { Spacing, Sizing } = SizesAndSpaces

export const HeaderCell = <T extends TableItem>({
  header,
  isSticky,
  width,
}: {
  header: Header<T, unknown>
  isSticky: boolean
  width?: string | number
}) => {
  const { column } = header
  const canSort = column.getCanSort()
  const { tooltip } = column.columnDef.meta ?? {}

  const headerEl = flexRender(column.columnDef.header, header.getContext())
  const isSorted = column.getIsSorted()
  console.log({ isSorted, id: column.id })
  return (
    <Typography
      component="th"
      sx={{
        textAlign: getAlignment(column),
        verticalAlign: 'bottom',
        padding: Spacing.sm,
        paddingBlockStart: 0,
        color: `text.${isSorted ? 'primary' : 'secondary'}`,
        ...getExtraColumnPadding(column),
        ...(canSort && {
          cursor: 'pointer',
          '&:hover': {
            color: `text.highlight`,
          },
        }),
        ...(isSticky && {
          position: 'sticky',
          left: 0,
          zIndex: (t) => t.zIndex.tableHeaderStickyColumn,
          backgroundColor: (t) => t.design.Table.Header.Fill,
          borderRight: (t) => `1px solid ${t.design.Layer[1].Outline}`,
        }),
        width,
        minWidth: Sizing['3xl'],
      }}
      colSpan={header.colSpan}
      onClick={column.getToggleSortingHandler()}
      data-testid={`data-table-header-${column.id}`}
      variant="tableHeaderS"
    >
      <Tooltip title={tooltip?.title} {...tooltip}>
        <Sortable column={column} isEnabled={canSort}>
          {headerEl}
        </Sortable>
      </Tooltip>
    </Typography>
  )
}
