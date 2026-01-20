import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row, type Table } from '@tanstack/react-table'
import { getInsetShadow, getShadow } from '@ui-kit/themes/basic-theme/shadows'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TableItem } from './data-table.utils'

const { Spacing } = SizesAndSpaces

// Panel used when row is expanded on mobile
export type ExpandedPanel<T extends TableItem> = (props: { row: Row<T>; table: Table<T> }) => ReactNode

/**
 * Expansion bar with that shows a details panel when the row is expanded on mobile.
 */
export function ExpansionRow<T extends TableItem>({
  row,
  table,
  expandedPanel: ExpandedPanel,
  colSpan,
}: {
  row: Row<T>
  table: Table<T>
  expandedPanel: ExpandedPanel<T>
  colSpan: number
}) {
  const { render, onExited, expanded } = useRowExpansion(row)
  const { design } = useTheme()
  const boxShadow = useMemo(() => getShadow(design, 3), [design])
  const insetShadow = useMemo(() => getInsetShadow(design, 3), [design])
  return (
    render && (
      // add a scale(1) so the box-shadow is applied correctly on top of the next table row
      <TableRow sx={{ boxShadow, transform: 'scale(1)' }} data-testid="data-table-expansion-row">
        <TableCell colSpan={colSpan} sx={{ padding: 0, boxShadow: insetShadow, borderBottom: 'none' }}>
          <Collapse in={expanded} onExited={onExited}>
            <Stack
              gap={Spacing.lg}
              paddingInline={Spacing.md}
              paddingBlockStart={Spacing.md}
              paddingBlockEnd={0}
              direction="column"
            >
              <ExpandedPanel row={row} table={table} />
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRender(true)
      } else if (!expanded) {
        setExpanded(true)
      }
    } else if (expanded) {
      setExpanded(false)
    }
  }, [expanded, render, rowExpanded])
  const onExited = useCallback(() => setRender(false), [])
  return { render, onExited, expanded }
}
