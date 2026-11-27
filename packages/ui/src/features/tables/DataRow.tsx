import { type MouseEvent, ReactNode, useState } from 'react'
import TableRow from '@mui/material/TableRow'
import { Subscribe, type Cell, type ReactTable, type Row, type RowData } from '@tanstack/react-table'
import { InvertOnHover } from '@ui/components/InvertOnHover'
import { TRANSITION_FUNCTION } from '@ui/features/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useNavigate } from '@ui/hooks/router'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { hasParentWithClass } from '@ui/lib/dom'
import { BREAKDOWN_ROW_CLASS, BreakdownRows } from './BreakdownRows'
import type { DataTableRowHeight } from './categories'
import {
  CLICKABLE_IN_ROW_CLASS,
  type CurveTableFeatures,
  DESKTOP_ONLY_HOVER_CLASS,
  TABLE_SECONDARY_TEXT_CLASS,
} from './data-table.utils'
import { DataCell } from './DataCell'
import { ExpandedPanelConfig, ExpansionRow } from './ExpansionRow'

const { Height } = SizesAndSpaces
const ROW_CONTROLS = `.${CLICKABLE_IN_ROW_CLASS}, a[href], button, input, select, textarea, [role=button], [role=link]`

// When a breakdown row is expanded, remove all bottom borders except for the last breakdown row.
// We use borderBlockEndWidth and set transitionProperty to eliminate transition color flashing.
const breakdownRowSx = {
  '& > td': { transitionProperty: { tablet: 'color' } },
  [`&&:has(+ tr.${BREAKDOWN_ROW_CLASS}) > td`]: { borderBlockEndWidth: 0 },
}

export type RowBreakdownConfig<TData extends RowData, TItem> = {
  /** Items to render as breakdown rows under the parent row. Fewer than 2 items means no breakdown rows. */
  getItems: (data: TData) => readonly TItem[]
  /** Unique key of an item within its parent row */
  getItemKey: (item: TItem, index: number) => string
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
  rowHeight?: DataTableRowHeight
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

const isRowSurfaceClick = ({ currentTarget, defaultPrevented, target }: MouseEvent<HTMLTableRowElement>) =>
  !defaultPrevented && target instanceof Element && currentTarget.contains(target) && !target.closest(ROW_CONTROLS)

export const DataRow = <TData extends RowData>(props: DataRowProps<TData>) => (
  <Subscribe source={props.row.table.atoms.columnVisibility} selector={() => props.row.getVisibleCells()}>
    {visibleCells => <DataRowContent {...props} visibleCells={visibleCells} />}
  </Subscribe>
)

const DataRowContent = <TData extends RowData>({
  table,
  row,
  visibleCells,
  expandedPanel,
  rowBreakdown,
  shouldStickFirstColumn,
  verticalAlign = 'middle',
  rowHeight = 'lg',
}: DataRowProps<TData> & { visibleCells: Cell<CurveTableFeatures, TData>[] }) => {
  const isMobile = useIsMobile()
  const [element, setElement] = useState<HTMLTableRowElement | null>(null) // note: useRef doesn't get updated in cypress
  const push = useNavigate()
  const href = table.options.meta?.getRowHref?.(row.original)
  const hasExpansionRow = isMobile && !!expandedPanel
  const breakdownItems = isMobile ? undefined : rowBreakdown?.getItems(row.original)
  const hasBreakdown = !!breakdownItems && breakdownItems.length > 1
  const isInteractive = !!href || hasExpansionRow || hasBreakdown

  const onClickRow = (event: MouseEvent<HTMLTableRowElement>) => {
    if (isMobile || hasBreakdown) {
      if (!rowBreakdown || isRowSurfaceClick(event)) row.toggleExpanded()
    } else if (href) {
      onCellClick(event.target, href, push)
    }
  }

  return (
    <>
      <InvertOnHover
        hoverColor={t => t.design.Table.Row.Hover}
        hoverRef={{ current: element }}
        disabled={!isInteractive}
      >
        <TableRow
          sx={{
            marginBlock: 0,
            minHeight: Height.table.row[rowHeight],
            cursor: isInteractive ? 'pointer' : 'default',
            verticalAlign,
            transition: `border-bottom ${TRANSITION_FUNCTION}`,
            ...(rowBreakdown && breakdownRowSx),
            [`& .${TABLE_SECONDARY_TEXT_CLASS}`]: { color: t => t.design.Table.Text.Default.Secondary },
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
          }}
          ref={setElement}
          data-testid={element && `data-table-row-${row.id}`}
          // eslint-disable-next-line local/no-router-navigate-on-click -- A `<tr>` cannot be a link.
          onClick={isMobile || isInteractive ? onClickRow : undefined}
        >
          {visibleCells.map((cell, index) => (
            <DataCell
              key={cell.id}
              cell={cell}
              showCollapseIcon={hasExpansionRow && index === visibleCells.length - 1}
              isSticky={!!shouldStickFirstColumn && !index}
            />
          ))}
        </TableRow>
      </InvertOnHover>

      {hasBreakdown && rowBreakdown && (
        <BreakdownRows
          row={row}
          items={breakdownItems}
          visibleCells={visibleCells}
          config={rowBreakdown}
          shouldStickFirstColumn={shouldStickFirstColumn}
          rowSx={breakdownRowSx}
        />
      )}

      {hasExpansionRow && (
        <ExpansionRow colSpan={visibleCells.length} row={row} expandedPanel={expandedPanel} table={table} />
      )}
    </>
  )
}
