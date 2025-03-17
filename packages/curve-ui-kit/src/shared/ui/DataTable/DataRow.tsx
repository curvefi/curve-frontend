import { useRouter } from 'next/navigation'
import { type MouseEvent, useCallback, useRef } from 'react'
import TableRow from '@mui/material/TableRow'
import type { SystemStyleObject, Theme } from '@mui/system'
import { type Row } from '@tanstack/react-table'
import useIntersectionObserver from '@ui-kit/hooks/useIntersectionObserver'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { CypressHoverClass, hasParentWithClass } from '@ui-kit/utils/dom'
import { InvertOnHover } from '../InvertOnHover'
import { AssumeRowsVisible, ClickableInRowClass, DesktopOnlyHoverClass, type TableItem } from './data-table.utils'
import { DataCell } from './DataCell'

const onCellClick = (target: EventTarget, url: string, routerNavigate: (href: string) => void) => {
  // ignore clicks on elements that should be clickable inside the row
  if (hasParentWithClass(target, ClickableInRowClass, { untilTag: 'TR' })) {
    return
  }
  // redirect to the url or navigate to the route
  if (url.startsWith('http')) {
    location.href = url
  } else {
    routerNavigate(url)
  }
}

export const DataRow = <T extends TableItem>({ row, sx }: { row: Row<T>; sx?: SystemStyleObject<Theme> }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const { push } = useRouter()
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true }) // what about "TanStack Virtual"?
  const url = row.original.url
  const onClick = useCallback((e: MouseEvent<HTMLTableRowElement>) => onCellClick(e.target, url, push), [url, push])
  return (
    <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverRef={ref}>
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
        ref={ref}
        data-testid={`data-table-row-${row.id}`}
        onClick={onClick}
      >
        {/* render cells when visible vertically, so content is lazy loaded */}
        {(entry?.isIntersecting || row.index < AssumeRowsVisible) &&
          row.getVisibleCells().map((cell) => <DataCell key={cell.id} cell={cell} />)}
      </TableRow>
    </InvertOnHover>
  )
}
