import { type MouseEvent, useCallback, useMemo, useState } from 'react'
import { useNavigate } from '@evm-ui/hooks/router'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { TRANSITION_FUNCTION } from '@evm-ui/themes/design/0_primitives'
import { hasParentWithClass } from '@evm-ui/utils/dom'
import TableRow from '@mui/material/TableRow'
import type { ReactTable, Row, RowData } from '@tanstack/react-table'
import { InvertOnHover } from '../InvertOnHover'
import {
  CLICKABLE_IN_ROW_CLASS,
  type CurveTableFeatures,
  DESKTOP_ONLY_HOVER_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from './data-table.utils'
import { DataCell } from './DataCell'
import { type ExpandedPanelConfig, ExpansionRow } from './ExpansionRow'

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

export type LegacyDataRowProps<TData extends RowData> = {
  table: ReactTable<CurveTableFeatures, TData>
  row: Row<CurveTableFeatures, TData>
  expandedPanel?: ExpandedPanelConfig<TData>
  isLastRow?: boolean
  shouldStickLastRowToTop?: boolean
  shouldStickFirstColumn?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

export const LegacyDataRow = <TData extends RowData>({
  table,
  row,
  expandedPanel,
  isLastRow,
  shouldStickLastRowToTop,
  shouldStickFirstColumn,
  verticalAlign = 'middle',
}: LegacyDataRowProps<TData>) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const href = table.options.meta?.getRowHref?.(row.original)
  const hasHref = Boolean(href?.trim())
  const onClickDesktop = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => hasHref && href && onCellClick(e.target, href, push),
    [href, push, hasHref],
  )
  const visibleCells = row.getVisibleCells()
  const shouldApplyStickyLastRow = isLastRow && shouldStickLastRowToTop

  return (
    <>
      <InvertOnHover hoverColor={t => t.design.Table.Row.Hover} hoverRef={{ current: element }} disabled={isMobile}>
        <TableRow
          sx={useMemo(
            () => ({
              marginBlock: 0,
              cursor: hasHref ? 'pointer' : 'default',
              verticalAlign,
              transition: `border-bottom ${TRANSITION_FUNCTION}`,
              [`& .${DESKTOP_ONLY_HOVER_CLASS}`]: {
                opacity: { mobile: 1, desktop: 0 },
                transition: `opacity ${TRANSITION_FUNCTION}`,
              },
              [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: {
                color: t => t.design.Table.Text.Default.Secondary,
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
              ...(shouldApplyStickyLastRow && {
                // Keep the final row visible near the table end without covering the sticky header.
                position: 'sticky',
                top: 0,
                backgroundColor: t => t.design.Table.Row.Default,
              }),
            }),
            [shouldApplyStickyLastRow, hasHref, verticalAlign],
          )}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          // eslint-disable-next-line local/no-router-navigate-on-click -- A `<tr>` cannot be a link.
          onClick={isMobile ? () => row.toggleExpanded() : hasHref ? onClickDesktop : undefined}
        >
          {visibleCells.map((cell, index) => (
            <DataCell
              key={cell.id}
              cell={cell}
              enableCollapse={isMobile && !!expandedPanel}
              isSticky={!!shouldStickFirstColumn && !index}
            />
          ))}
        </TableRow>
      </InvertOnHover>

      {isMobile && expandedPanel && (
        <ExpansionRow colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} table={table} />
      )}
    </>
  )
}
