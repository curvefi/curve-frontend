import { ReactNode, useEffect, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'

// component used when row is expanded on mobile
export type ExpandedPanel<T extends TableItem> = (props: { row: Row<T> }) => ReactNode

export function ExpansionRow<T extends TableItem>({
  row,
  expandedPanel: ExpandedPanel,
  colSpan,
}: {
  row: Row<T>
  expandedPanel: ExpandedPanel<T>
  colSpan: number
}) {
  const rowExpanded = row.getIsExpanded()
  const [render, setRender] = useState(rowExpanded)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    // use an effect so that the animation is triggered just after mount
    if (rowExpanded) {
      if (!render) {
        setRender(true)
      } else if (!expanded) {
        setExpanded(true)
      }
    } else if (expanded) {
      setExpanded(false)
    }
  }, [expanded, render, rowExpanded])

  return (
    render && (
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse in={expanded} onExited={() => setRender(false)}>
            <ExpandedPanel row={row} />
          </Collapse>
        </TableCell>
      </TableRow>
    )
  )
}
