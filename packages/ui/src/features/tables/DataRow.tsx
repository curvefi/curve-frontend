import { type MouseEvent, ReactNode, useCallback, useMemo, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import type { ReactTable, Row, RowData } from '@tanstack/react-table'
import { InvertOnHover } from '@ui/components/InvertOnHover'
import { TRANSITION_FUNCTION } from '@ui/features/themes/design/0_primitives'
import { useNavigate } from '@ui/hooks/router'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { hasParentWithClass } from '@ui/lib/dom'
import { BreakdownRows } from './BreakdownRows'
import {
  CLICKABLE_IN_ROW_CLASS,
  type CurveTableFeatures,
  DESKTOP_ONLY_HOVER_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from './data-table.utils'
import { DataCell } from './DataCell'
import { ExpandedPanelConfig, ExpansionRow } from './ExpansionRow'

export type RowBreakdownConfig<TData extends RowData, TItem> = {
  /** Items to render as breakdown rows under the parent row. Fewer than 2 items means no breakdown rows. */
  getItems: (data: TData) => readonly TItem[]
  /** Unique key of an item within its parent row */
  getItemKey: (item: TItem) => string
  /** Cell renderers keyed by column id. Columns without a renderer are left empty. */
  cells: Partial<Record<string, (item: TItem, data: TData) => ReactNode>>
}

export type DataRowProps<TData extends RowData> = {
  table: ReactTable<CurveTableFeatures, TData>
  row: Row<CurveTableFeatures, TData>
  expandedPanel?: ExpandedPanelConfig<TData>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the item type is only known by the config itself
  rowBreakdown?: RowBreakdownConfig<TData, any> // Renders extra rows under a parent row, one per item (e.g. one row per token of a multi-token event)
  shouldStickFirstColumn?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

const navigate = (url: string, routerNavigate: (href: string) => void) => {
  if (url.startsWith('http')) {
    location.href = url // external link
  } else {
    routerNavigate(url) // internal link
  }
}

export const DataRow = <TData extends RowData>({
  table,
  row,
  expandedPanel,
  rowBreakdown,
  shouldStickFirstColumn,
  verticalAlign = 'middle',
}: DataRowProps<TData>) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const { getRowHref, onRowClick, isRowSelected } = table.options.meta ?? {}
  const href = getRowHref?.(row.original)
  const isSelected = !!isRowSelected?.(row.original)
  const hasExpansionRow = isMobile && !!expandedPanel
  const isInteractive = !!href || !!onRowClick || hasExpansionRow
  const onClickRow = useCallback(
    (e: MouseEvent<HTMLTableRowElement>) => {
      // ignore clicks on elements that should be clickable inside the row
      if (hasParentWithClass(e.target, CLICKABLE_IN_ROW_CLASS, { untilTag: 'TR' })) return
      if (onRowClick) onRowClick(row.original)
      else if (href) navigate(href, push)
    },
    [href, onRowClick, row.original, push],
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
              [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: { color: t => t.design.Table.Text.Default.Secondary },
              ...(isSelected && { '& td, & th': { backgroundColor: t => t.design.Table.Row.Selected } }),
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
                  [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: { color: t => t.design.Table.Text.Hover.Secondary },
                },
              }),
            }),
            [isInteractive, isSelected, verticalAlign],
          )}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          aria-selected={isRowSelected && isSelected}
          // eslint-disable-next-line local/no-router-navigate-on-click -- A `<tr>` cannot be a link.
          onClick={
            isMobile && (hasExpansionRow || !onRowClick)
              ? () => row.toggleExpanded()
              : href || onRowClick
                ? onClickRow
                : undefined
          }
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

      {!isMobile && rowBreakdown && (
        <BreakdownRows row={row} config={rowBreakdown} shouldStickFirstColumn={shouldStickFirstColumn} />
      )}

      {hasExpansionRow && (
        <ExpansionRow colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} table={table} />
      )}
    </>
  )
}
