import { ReactNode, useEffect, useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

// Panel used when row is expanded on mobile
export type ExpandedPanel<T extends TableItem> = (props: { row: Row<T> }) => ReactNode

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
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
    // we need some magic to avoid rendering the row at all when hidden
    // (it's apparently hard to render a <tr> with height 0 in a browser-compatible way)
    // it would be tidier to use a grid layout for the whole table
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
            <Stack
              gap={Spacing.lg}
              paddingInline={Spacing.md}
              paddingBlockStart={Spacing.md}
              paddingBlockEnd={0}
              direction="column"
            >
              <ExpandedPanel row={row} />
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    )
  )
}

export const ExpansionPanelSection = ({ children, title }: { children: ReactNode[]; title: ReactNode }) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={12}>
      <CardHeader title={title} sx={{ paddingInline: 0 }}></CardHeader>
    </Grid>
    {children.filter(Boolean).map((child, index) => (
      <Grid size={6} key={index}>
        {child}
      </Grid>
    ))}
  </Grid>
)
