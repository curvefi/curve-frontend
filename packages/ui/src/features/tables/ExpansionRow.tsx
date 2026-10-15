import { type FunctionComponent } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { Subscribe, type RowData } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import type { DataRowProps } from './DataRow'

const { Spacing } = SizesAndSpaces

/** A component that renders part of the expanded panel for a table row */
export type ExpandedPanelComponent<TData extends RowData> = FunctionComponent<
  Pick<DataRowProps<TData>, 'row' | 'table'>
>
export type ExpandedPanelConfig<TData extends RowData> = {
  Body: ExpandedPanelComponent<TData>
  Actions?: ExpandedPanelComponent<TData>
}

type ExpansionRowProps<TData extends RowData> = Pick<DataRowProps<TData>, 'table' | 'row'> & {
  expandedPanel: ExpandedPanelConfig<TData>
  colSpan: number
}

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
export const ExpansionRow = <TData extends RowData>(props: ExpansionRowProps<TData>) => (
  <Subscribe source={props.row.table.atoms.expanded} selector={() => props.row.getIsExpanded()}>
    {rowExpanded => <ExpansionRowContent {...props} rowExpanded={rowExpanded} />}
  </Subscribe>
)

function ExpansionRowContent<TData extends RowData>({
  row,
  table,
  expandedPanel: { Body, Actions },
  colSpan,
  rowExpanded,
}: ExpansionRowProps<TData> & { rowExpanded: boolean }) {
  const [keepMounted, onEnter, onExited] = useSwitch(false)
  return (
    (rowExpanded || keepMounted) && (
      <TableRow data-testid={rowExpanded ? 'data-table-expansion-row' : undefined}>
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse appear in={rowExpanded} onEnter={onEnter} onExited={onExited}>
            <Stack direction="column" sx={{ gap: Spacing.md, paddingBlockStart: Spacing.md }}>
              <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md }}>
                <Body row={row} table={table} />
              </Stack>
              {Actions && <Actions row={row} table={table} />}
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    )
  )
}
