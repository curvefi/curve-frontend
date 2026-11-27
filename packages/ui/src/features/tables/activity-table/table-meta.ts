import { assert } from '@primitives/objects.utils'
import type { Table } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { ActivityRow, ActivityTableMeta } from './types'

export const getActivityTableMeta = (table: Table<CurveTableFeatures, ActivityRow>): ActivityTableMeta =>
  assert(table.options.meta, 'Activity table metadata is required') as ActivityTableMeta
