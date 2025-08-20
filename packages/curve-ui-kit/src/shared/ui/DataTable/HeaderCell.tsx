import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { flexRender, type Header } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { RotatableIcon } from '@ui-kit/shared/ui/DataTable/RotatableIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, getFlexAlignment, type TableItem } from './data-table.utils'

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
  const isSorted = column.getIsSorted()
  const canSort = column.getCanSort()
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
      <Stack direction="row" justifyContent={getFlexAlignment(column)} alignItems="end">
        {flexRender(column.columnDef.header, header.getContext())}
        <RotatableIcon
          icon={ArrowDownIcon}
          rotated={isSorted === 'asc'}
          fontSize={isSorted ? 20 : 0}
          isEnabled={canSort}
        />
      </Stack>
    </Typography>
  )
}
