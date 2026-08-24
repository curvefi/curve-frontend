import { type MouseEvent, useCallback, useMemo, useState } from 'react'
import { useNavigate } from '@evm-ui/hooks/router'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { TRANSITION_FUNCTION } from '@evm-ui/themes/design/0_primitives'
import { hasParentWithClass } from '@evm-ui/utils/dom'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import type { Table } from '@tanstack/table-core'
import { InvertOnHover } from '../InvertOnHover'
import {
  CLICKABLE_IN_ROW_CLASS,
  DESKTOP_ONLY_HOVER_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
  type TableItem,
} from './data-table.utils'
import { DataCell } from './DataCell'
import { ExpandedPanelConfig, ExpansionRow } from './ExpansionRow'

export type DataRowProps<T extends TableItem> = {
  table: Table<T>
  row: Row<T>
  expandedPanel?: ExpandedPanelConfig<T>
  shouldStickFirstColumn?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

const onCellClick = (target: EventTarget, url: string, routerNavigate: (href: string) => void) => {
  // ignore clicks on elements that should be clickable inside the row
  if (hasParentWithClass(target, CLICKABLE_IN_ROW_CLASS, { untilTag: 'TR' })) {
    return
  }
  if (url.startsWith('http')) {
    location.href = url // external link
  } else {
    routerNavigate(url) // internal link
  }
}

export const DataRow = <T extends TableItem>({
  table,
  row,
  expandedPanel,
  shouldStickFirstColumn,
  verticalAlign = 'middle',
}: DataRowProps<T>) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const url = row.original.url
  const hasUrl = Boolean(url?.trim())
  const hasExpansionRow = isMobile && !!expandedPanel
  const isInteractive = hasUrl || hasExpansionRow
  const onClickDesktop = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => hasUrl && url && onCellClick(e.target, url, push),
    [url, push, hasUrl],
  )
  const visibleCells = row.getVisibleCells()

  return (
    <>
      <InvertOnHover
        hoverColor={t => t.design.Table.Row.Hover}
        hoverRef={{ current: element }}
        disabled={!isInteractive}
      >
        <TableRow
          sx={useMemo(
            () => ({
              marginBlock: 0,
              cursor: isInteractive ? 'pointer' : 'default',
              verticalAlign,
              transition: `border-bottom ${TRANSITION_FUNCTION}`,
              [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: {
                color: t => t.design.Table.Text.Default.Secondary,
              },
              ...(isInteractive && {
                [`& .${DESKTOP_ONLY_HOVER_CLASS}`]: {
                  opacity: { mobile: 1, desktop: 0 },
                  transition: `opacity ${TRANSITION_FUNCTION}`,
                },
                '&:hover': {
                  [`& .${DESKTOP_ONLY_HOVER_CLASS}`]: { opacity: { desktop: 1 } },
                  '& td, & th': {
                    backgroundColor: t => t.design.Table.Row.Hover,
                    color: t => t.design.Table.Text.Hover.Primary,
                  },
                  [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: {
                    color: t => t.design.Table.Text.Hover.Secondary,
                  },
                },
              }),
            }),
            [isInteractive, verticalAlign],
          )}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          onClick={isMobile ? () => row.toggleExpanded() : hasUrl ? onClickDesktop : undefined}
        >
          {visibleCells.map((cell, index) => (
            <DataCell
              key={cell.id}
              cell={cell}
              enableCollapse={hasExpansionRow}
              isSticky={!!shouldStickFirstColumn && !index}
            />
          ))}
        </TableRow>
      </InvertOnHover>

      {hasExpansionRow && (
        <ExpansionRow<T> colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} table={table} />
      )}
    </>
  )
}
