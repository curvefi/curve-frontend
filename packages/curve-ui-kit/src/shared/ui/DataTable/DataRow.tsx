import { type MouseEvent, useCallback, useMemo, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import type { Table } from '@tanstack/table-core'
import { useNavigate } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useIsVisible } from '@ui-kit/hooks/useIntersectionObserver'
import type { Responsive } from '@ui-kit/themes/basic-theme'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { CypressHoverClass, hasParentWithClass } from '@ui-kit/utils/dom'
import { InvertOnHover } from '../InvertOnHover'
import { ClickableInRowClass, DesktopOnlyHoverClass, type TableItem } from './data-table.utils'
import { DataCell } from './DataCell'
import { type ExpandedPanel, ExpansionRow } from './ExpansionRow'

const onCellClick = (target: EventTarget, url: string, routerNavigate: (href: string) => void) => {
  // ignore clicks on elements that should be clickable inside the row
  if (hasParentWithClass(target, ClickableInRowClass, { untilTag: 'TR' })) {
    return
  }
  if (url.startsWith('http')) {
    location.href = url // external link
  } else {
    routerNavigate(url) // internal link
  }
}

export type DataRowProps<T extends TableItem> = {
  table: Table<T>
  row: Row<T>
  isLast: boolean
  expandedPanel: ExpandedPanel<T>
  shouldStickFirstColumn: boolean
  lazy?: boolean // whether to wait until the row is visible to render its cells
  minRowHeight?: Responsive
}

export const DataRow = <T extends TableItem>({
  table,
  isLast,
  row,
  expandedPanel,
  shouldStickFirstColumn,
  lazy,
  minRowHeight,
}: DataRowProps<T>) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const url = row.original.url
  const hasUrl = Boolean(url?.trim())
  const onClickDesktop = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => hasUrl && url && onCellClick(e.target, url, push),
    [url, push, hasUrl],
  )
  const visibleCells = row.getVisibleCells()
  const isVisible = useIsVisible<HTMLTableRowElement>(element, lazy) || !lazy

  return (
    <>
      <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverEl={element} disabled={isMobile}>
        <TableRow
          sx={useMemo(
            () => ({
              minHeight: minRowHeight,
              marginBlock: 0,
              cursor: hasUrl ? 'pointer' : 'default',
              transition: `border-bottom ${TransitionFunction}`,
              [`& .${DesktopOnlyHoverClass}`]: {
                opacity: { mobile: 1, desktop: 0 },
                transition: `opacity ${TransitionFunction}`,
              },
              '&:hover': {
                [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: 1 } },
                '& td, & th': {
                  backgroundColor: (t) => t.design.Table.Row.Hover,
                },
              },
              [`&.${CypressHoverClass}`]: { [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: 1 } } },
              ...(isLast && {
                // to avoid the sticky header showing without any rows, show the last row on top of it
                position: 'sticky',
                zIndex: (t) => t.zIndex.tableStickyLastRow,
                top: 0,
                backgroundColor: (t) => t.design.Table.Row.Default,
              }),
            }),
            [isLast, hasUrl, minRowHeight],
          )}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          onClick={isMobile ? () => row.toggleExpanded() : hasUrl ? onClickDesktop : undefined}
        >
          {isVisible &&
            visibleCells.map((cell, index) => (
              <DataCell key={cell.id} cell={cell} isMobile={isMobile} isSticky={shouldStickFirstColumn && !index} />
            ))}
        </TableRow>
      </InvertOnHover>

      {isMobile && (
        <ExpansionRow<T> colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} table={table} />
      )}
    </>
  )
}
