import { groupBy } from 'lodash'
import { assert, fromEntries, recordEntries } from '@primitives/objects.utils'
import type { SortingState } from '@tanstack/react-table'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import type { MarketColumnId } from './columns.enum'

/**
 * A column of a market table, its fields decide the visibility of the column.
 * No `header`: only used for filtering. `enableHiding: false`: always shown. `meta.defaultHidden`: starts hidden.
 */
type MarketColumn = {
  id: string
  header?: unknown
  enableHiding?: boolean
  enableSorting?: boolean
  filterFn?: unknown
  meta?: { defaultHidden?: boolean; settingsGroup?: string }
}

/** Columns the user changed from their default, every other column follows its default. */
type ColumnOverrides = Partial<Record<string, boolean>>

type StoredGroups = Pick<VisibilityGroup<string>, 'options'>[]

const STORAGE_VERSION = 10

const canToggle = ({ header, enableHiding }: MarketColumn) => !!header && enableHiding !== false

const isShownByDefault = ({ header, meta }: MarketColumn) => !!header && !meta?.defaultHidden

const isColumnVisible = (column: MarketColumn, overrides: ColumnOverrides) =>
  canToggle(column) ? (overrides[column.id] ?? isShownByDefault(column)) : isShownByDefault(column)

export const getColumnVisibility = (columns: readonly MarketColumn[], overrides: ColumnOverrides) =>
  fromEntries(columns.map(column => [column.id, isColumnVisible(column, overrides)]))

/** The settings of the visibility popover: one switch per column, named after its header. */
export const getColumnSettings = (
  columns: readonly MarketColumn[],
  overrides: ColumnOverrides,
): VisibilityGroup<MarketColumnId>[] =>
  recordEntries(
    groupBy(columns.filter(canToggle), ({ id, meta }) =>
      assert(meta?.settingsGroup, `Column without settings group: ${id}`),
    ),
  ).map(([label, groupColumns]) => ({
    label,
    options: groupColumns.map(column => ({
      label: String(column.header),
      columns: [column.id as MarketColumnId],
      active: isColumnVisible(column, overrides),
      enabled: true,
    })),
  }))

/**
 * Before version 10 every table stored the settings of four variants, and the market list used two of them.
 * A column is overridden when its stored setting differs from its default in any of the given groups.
 */
const migrateGroupsToOverrides = (storedGroups: StoredGroups, columns: readonly MarketColumn[]): ColumnOverrides => {
  const storedOptions = storedGroups.flatMap(({ options }) => options)
  return fromEntries(
    columns
      .filter(canToggle)
      .filter(column =>
        storedOptions.some(
          ({ columns: ids, active }) => ids.includes(column.id) && active !== isShownByDefault(column),
        ),
      )
      .map(column => [column.id, !isShownByDefault(column)] as const),
  )
}

export const inGroup = <TColumn extends Partial<MarketColumn>>(settingsGroup: string, columns: TColumn[]) =>
  columns.map(column => ({ ...column, meta: { ...column.meta, settingsGroup } }))

/** A column shown differently on one table, keeping the rest of its definition. */
export const adapt = <TColumn extends Partial<MarketColumn>>(
  column: TColumn,
  {
    meta,
    ...overrides
  }: Partial<Pick<TColumn, Extract<keyof TColumn, 'header' | 'cell'>>> & Pick<MarketColumn, 'meta'>,
) => ({ ...column, ...overrides, meta: { ...column.meta, ...meta } })

/** A table showing markets, its columns are the only source for what is shown, sorted, filtered and toggled. */
export const defineMarketTable = <TColumn extends Partial<MarketColumn>>({
  columns: columnInputs,
  deprecatedVariants,
  ...table
}: {
  testId: string
  defaultSort: SortingState
  sortQueryField: string
  storageKey: string
  /** The removed variants holding the settings of this table before version 10 */
  deprecatedVariants: string[]
  columns: TColumn[]
}) => {
  const columns = columnInputs.map(column => ({
    ...column,
    id: assert(column.id, 'Market column without id'),
    enableSorting: column.header ? column.enableSorting : false, // columns without a header only exist for their filter
  }))
  return {
    ...table,
    columns,
    filterColumns: fromEntries(
      columns.filter(({ filterFn }) => filterFn).map(({ id }) => [id, id as MarketColumnId] as const),
    ),
    migration: {
      version: STORAGE_VERSION,
      migrate: (oldValue: unknown) =>
        migrateGroupsToOverrides(
          deprecatedVariants.flatMap(variant => (oldValue as Record<string, StoredGroups | undefined>)[variant] ?? []),
          columns,
        ),
    } satisfies MigrationOptions<ColumnOverrides>,
  }
}
