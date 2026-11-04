import type { ComponentType } from 'react'
import type { CellContext, RowData } from '@tanstack/react-table'
import type { QueryProp } from '@ui/features/queries/util'
import type { CurveTableFeatures } from './data-table.utils'
import { QueryCell } from './QueryCell'

/** A cell that waits on a query of its row, the cell itself only has to render the loaded value. */
export const withQuery =
  <TData extends RowData, TValue>(
    getQuery: (row: TData) => QueryProp<unknown>,
    Cell: ComponentType<CellContext<CurveTableFeatures, TData, TValue>>,
  ) =>
  (props: CellContext<CurveTableFeatures, TData, TValue>) => (
    <QueryCell query={getQuery(props.row.original)}>
      <Cell {...props} />
    </QueryCell>
  )
