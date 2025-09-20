import { type MouseEvent, useCallback, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import { type Row } from '@tanstack/react-table'
import { useNavigate } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { CypressHoverClass, hasParentWithClass } from '@ui-kit/utils/dom'
import { InvertOnHover } from '../InvertOnHover'
import { ClickableInRowClass, DesktopOnlyHoverClass, type TableItem } from './data-table.utils'
import { DataCell } from './DataCell'
import { type ExpandedPanel, ExpansionRow } from './ExpansionRow'

const onCellClick = (target: EventTarget, url: string | null | undefined, routerNavigate: (href: string) => void) => {
  // ignore clicks on elements that should be clickable inside the row
  if (hasParentWithClass(target, ClickableInRowClass, { untilTag: 'TR' })) {
    return
  }
  // do nothing if URL is not provided or is empty/whitespace (disabled click behavior)
  if (!url?.trim()) {
    return
  }
  if (url.startsWith('http')) {
    location.href = url // external link
  } else {
    routerNavigate(url) // internal link
  }
}

export type DataRowProps<T extends TableItem> = {
  row: Row<T>
  isLast: boolean
  expandedPanel: ExpandedPanel<T>
  shouldStickFirstColumn: boolean
}

export const DataRow = <T extends TableItem>({
  isLast,
  row,
  expandedPanel,
  shouldStickFirstColumn,
}: DataRowProps<T>) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const url = row.original.url
  const hasUrl = Boolean(url?.trim())
  const onClickDesktop = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => onCellClick(e.target, url, push),
    [url, push],
  )
  const visibleCells = row.getVisibleCells()

  return (
    <>
      <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverEl={element} disabled={isMobile}>
        <TableRow
          sx={{
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
          }}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          onClick={isMobile ? () => row.toggleExpanded() : hasUrl ? onClickDesktop : undefined}
        >
          {visibleCells.map((cell, index) => (
            <DataCell key={cell.id} cell={cell} isMobile={isMobile} isSticky={shouldStickFirstColumn && !index} />
          ))}
        </TableRow>
      </InvertOnHover>

      {isMobile && <ExpansionRow<T> colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} />}
    </>
  )
}
