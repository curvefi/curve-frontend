import { useRouter } from 'next/navigation'
import { type MouseEvent, useCallback, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { SystemStyleObject, Theme } from '@mui/system'
import { type Row } from '@tanstack/react-table'
import { type ExpandedPanel, ExpansionRow } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { CypressHoverClass, hasParentWithClass } from '@ui-kit/utils/dom'
import { InvertOnHover } from '../InvertOnHover'
import { ClickableInRowClass, DesktopOnlyHoverClass, type TableItem } from './data-table.utils'
import { DataCell } from './DataCell'

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

export const DataRow = <T extends TableItem>({
  row,
  sx,
  expandedPanel,
}: {
  row: Row<T>
  sx?: SystemStyleObject<Theme>
  expandedPanel: ExpandedPanel<T>
}) => {
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const { push } = useRouter()
  const url = row.original.url
  const isMobile = useMediaQuery((t) => t.breakpoints.down('tablet'))
  const onClickDesktop = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => onCellClick(e.target, url, push),
    [url, push],
  )
  const visibleCells = row.getVisibleCells().filter((cell) => !cell.column.columnDef.meta?.hidden)

  return (
    <>
      <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverEl={element} disabled={isMobile}>
        <TableRow
          sx={{
            marginBlock: 0,
            borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}`,
            cursor: 'pointer',
            transition: `border-bottom ${TransitionFunction}`,
            [`& .${DesktopOnlyHoverClass}`]: {
              opacity: { mobile: 1, desktop: 0 },
              transition: `opacity ${TransitionFunction}`,
            },
            '&:hover': { [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: 1 } } },
            [`&.${CypressHoverClass}`]: { [`& .${DesktopOnlyHoverClass}`]: { opacity: { desktop: 1 } } },
            ...sx,
          }}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          onClick={isMobile ? () => row.toggleExpanded() : onClickDesktop}
        >
          {visibleCells.map((cell, index) => (
            <DataCell key={cell.id} cell={cell} isLast={index == visibleCells.length - 1} isMobile={isMobile} />
          ))}
        </TableRow>
      </InvertOnHover>

      {isMobile && <ExpansionRow<T> colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} />}
    </>
  )
}
