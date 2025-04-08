import { useRouter } from 'next/navigation'
import { type MouseEvent, useCallback, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import type { SystemStyleObject, Theme } from '@mui/system'
import { type Row } from '@tanstack/react-table'
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
  // redirect to the url or navigate to the route
  if (url.startsWith('http')) {
    location.href = url
  } else {
    routerNavigate(url)
  }
}

export const DataRow = <T extends TableItem>({ row, sx }: { row: Row<T>; sx?: SystemStyleObject<Theme> }) => {
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const { push } = useRouter()
  const url = row.original.url
  const onClick = useCallback((e: MouseEvent<HTMLTableRowElement>) => onCellClick(e.target, url, push), [url, push])
  return (
    <InvertOnHover hoverColor={(t) => t.design.Table.Row.Hover} hoverEl={element}>
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
        onClick={onClick}
      >
        {row.getVisibleCells().map((cell) => (
          <DataCell key={cell.id} cell={cell} />
        ))}
      </TableRow>
    </InvertOnHover>
  )
}
