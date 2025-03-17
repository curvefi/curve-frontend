import Typography from '@mui/material/Typography'
import { flexRender, type Header, type SortDirection } from '@tanstack/react-table'
import { ArrowDownIcon } from '@ui-kit/shared/icons/ArrowDownIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getAlignment, getExtraColumnPadding, type TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

const SortArrow = ({ isSorted, canSort }: { isSorted: false | SortDirection; canSort: boolean }) => (
  <ArrowDownIcon
    sx={{
      ...(isSorted === 'asc' && { transform: `rotate(180deg)` }),
      verticalAlign: 'text-bottom',
      fontSize: isSorted ? 20 : 0,
      transition: `transform ${TransitionFunction}, font-size ${TransitionFunction}`,
      visibility: canSort ? 'visible' : 'hidden', // render it invisible to avoid layout shift
    }}
  />
)

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
        {flexRender(column.columnDef.header, header.getContext())}
        <SortArrow isSorted={isSorted} canSort={canSort} />
      </Typography>
    )
  )
}
