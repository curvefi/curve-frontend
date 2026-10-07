import { assert } from '@primitives/objects.utils'
import type { Table } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { PoolRow, PoolTableMeta } from './types'

/** Keeps the temporary metadata cast in one searchable place for every pool-table consumer. */
export const getPoolTableMeta = (table: Table<CurveTableFeatures, PoolRow>): PoolTableMeta =>
  assert(table.options.meta, 'Pool table metadata is required') as PoolTableMeta

/** Checks host metadata at construction without casting away missing or misspelled fields. */
export const createPoolTableMeta = (meta: PoolTableMeta) => meta
