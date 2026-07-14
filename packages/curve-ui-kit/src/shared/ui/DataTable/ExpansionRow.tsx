import { type FunctionComponent, useCallback, useEffect, useState } from 'react'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import type { Row } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { ExpandedPanelActionResolver, ExpandedPanelContext, TableItem } from './data-table.utils'
import type { DataRowProps } from './DataRow'
import { ExpandedPanelActions } from './ExpandedPanelActions'

const { Spacing } = SizesAndSpaces

export type ExpandedPanel<T extends TableItem> = FunctionComponent<ExpandedPanelContext<T>>

export type ExpandedPanelConfig<T extends TableItem> = {
  Body: ExpandedPanel<T>
  getActions?: ExpandedPanelActionResolver<T> // an array of actions that gets passed to `ExpandedPanelActions`.
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
  const { Body: ExpandedPanelBody, getActions } = expandedPanel
  const actions = getActions?.({ row, table }) ?? []

  const [testId, setTestId] = useState<string | null>(null)

  return (
    render && (
      <TableRow data-testid={testId}>
        <TableCell colSpan={colSpan} sx={{ padding: 0 }}>
          <Collapse
            in={expanded}
            onEntered={() => setTestId('data-table-expansion-row')}
            onExit={() => setTestId(null)}
            onExited={onExited}
          >
            <Stack direction="column" sx={{ gap: Spacing.md, paddingBlockStart: Spacing.md }}>
              <Stack sx={{ gap: Spacing.md, paddingInline: Spacing.md }}>
                <ExpandedPanelBody row={row} table={table} />
              </Stack>
              {actions.length > 0 && <ExpandedPanelActions actions={actions} />}
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
