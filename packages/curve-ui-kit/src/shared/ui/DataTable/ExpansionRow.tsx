import { FunctionComponent, useCallback, useEffect, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row, type Table } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TableItem } from './data-table.utils'
import type { DataRowProps } from './DataRow'

const { Spacing } = SizesAndSpaces

// Panel used when row is expanded on mobile
export type ExpandedPanel<T extends TableItem> = FunctionComponent<{ row: Row<T>; table: Table<T> }>

export type ExpandedPanelConfig<T extends TableItem> = {
  Body: ExpandedPanel<T>
  Footer?: ExpandedPanel<T>
}

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
export function ExpansionRow<T extends TableItem>({
  row,
  table,
  expandedPanel,
  colSpan,
}: Pick<DataRowProps<T>, 'table' | 'row'> & {
  expandedPanel: NonNullable<DataRowProps<T>['expandedPanel']>
  colSpan: number
}) {
  const { render, onExited, expanded } = useRowExpansion(row)
  const { Body: ExpandedPanelBody, Footer: ExpandedPanelFooter } = expandedPanel
  return (
    render && (
      <TableRow data-testid="data-table-expansion-row">
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse in={expanded} onExited={onExited}>
            <Stack direction="column" sx={{ gap: Spacing.md, paddingBlockStart: Spacing.md }}>
              <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md }}>
                <ExpandedPanelBody row={row} table={table} />
              </Stack>
              {ExpandedPanelFooter && (
                <Stack direction="row" sx={{ gap: Spacing.xs, '& > *': { flex: 1 } }}>
                  <ExpandedPanelFooter row={row} table={table} />
                </Stack>
              )}
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    )
  )
}

/**
 * Hook to manage the expansion of a row.
 *
 * We use an effect so that the animation is triggered just after mount,
 * we need some magic to avoid rendering the row at all when hidden
 * (it's apparently hard to render a table row with height 0 in a browser-compatible way).
 *
 * It would be tidier to use a grid layout for the whole table
 */
function useRowExpansion<T>(row: Row<T>) {
  const rowExpanded = row.getIsExpanded()
  const [render, setRender] = useState(rowExpanded)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (rowExpanded) {
      if (!render) {
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
        setRender(true)
      } else if (!expanded) {
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
        setExpanded(true)
      }
    } else if (expanded) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
      setExpanded(false)
    }
  }, [expanded, render, rowExpanded])
  const onExited = useCallback(() => setRender(false), [])
  return { render, onExited, expanded }
}
