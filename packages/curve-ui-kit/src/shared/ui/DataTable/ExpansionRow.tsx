import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import type { TableItem } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { getInsetShadow } from '@ui-kit/themes/basic-theme/shadows'
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
  const boxShadow = useInsetShadow()
  const { render, onExited, expanded } = useRowExpansion(row)
  return (
    render && (
      <TableRow sx={{ boxShadow }} data-testid="data-table-expansion-row">
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse in={expanded} onExited={onExited}>
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

/**
 * Hook to get the inset shadow for the expansion row.
 *
 * The shadow is defined in the design, but it doesn't work between HTML rows.
 */
function useInsetShadow() {
  const { design } = useTheme()
  return useMemo(() => getInsetShadow(design, 3), [design])
}
