import { ReactNode, useCallback, useEffect, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row, type Table } from '@tanstack/react-table'
import type { DataTableCategory, TableItem } from './data-table.utils'
import { DataRowProps } from './DataRow'

// Panel used when row is expanded on mobile
export type ExpandedPanel<T extends TableItem> = (props: {
  row: Row<T>
  table: Table<T>
  category: DataTableCategory
}) => ReactNode

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
export function ExpansionRow<T extends TableItem>({
  row,
  table,
  expandedPanel: ExpandedPanel,
  category,
  colSpan,
}: Pick<DataRowProps<T>, 'table' | 'row' | 'category'> & {
  expandedPanel: NonNullable<DataRowProps<T>['expandedPanel']>
  colSpan: number
}) {
  const { render, onExited, expanded } = useRowExpansion(row)
  return (
    render && (
      <TableRow data-testid="data-table-expansion-row">
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse in={expanded} onExited={onExited}>
            <ExpandedPanel category={category} row={row} table={table} />
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
