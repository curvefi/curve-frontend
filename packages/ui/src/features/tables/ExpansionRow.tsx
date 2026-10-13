import { type FunctionComponent } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import type { RowData } from '@tanstack/react-table'
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

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
export function ExpansionRow<TData extends RowData>({
  row,
  table,
  expandedPanel: { Body, Actions },
  colSpan,
}: Pick<DataRowProps<TData>, 'table' | 'row'> & {
  expandedPanel: NonNullable<DataRowProps<TData>['expandedPanel']>
  colSpan: number
}) {
  const expanded = row.getIsExpanded()
  const [keepMounted, onEnter, onExited] = useSwitch(false)
  return (
    (expanded || keepMounted) && (
      <TableRow data-testid={expanded ? 'data-table-expansion-row' : undefined}>
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse appear in={expanded} onEnter={onEnter} onExited={onExited}>
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
