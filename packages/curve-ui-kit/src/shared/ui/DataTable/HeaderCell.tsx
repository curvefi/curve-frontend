import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { flexRender, type Header } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { RotatableIcon } from '@ui-kit/shared/ui/DataTable/RotatableIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, getFlexAlignment, type TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

export const HeaderCell = <T extends TableItem>({ header }: { header: Header<T, unknown> }) => {
  const { column } = header
  const isSorted = column.getIsSorted()
  const canSort = column.getCanSort()
  const { hidden, borderRight } = column.columnDef.meta ?? {}
  return (
    !hidden && (
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
          ...(borderRight && { borderRight: (t) => `1px solid ${t.design.Layer[1].Outline}` }),
        }}
        colSpan={header.colSpan}
        width={header.getSize()}
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
  )
}
