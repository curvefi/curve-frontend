import { groupBy } from 'lodash'
import { assert, fromEntries, recordEntries } from '@primitives/objects.utils'
import type { SortingState } from '@tanstack/react-table'
import type { MigrationOptions } from '@ui/features/storage/useStoredState'
import type { VisibilityGroup } from '@ui/features/tables/visibility.types'
import type { MarketColumnId } from './columns.enum'

type MarketColumnInput = {
  id?: string
  header?: unknown
  enableHiding?: boolean
  enableSorting?: boolean
  filterFn?: unknown
  meta?: { defaultHidden?: boolean; settingsGroup?: string }
}

type MarketColumnShape = MarketColumnInput & { id: string }

/** Columns the user chose to show or hide, every other column follows its default. */
type ColumnChoices = Partial<Record<string, boolean>>

type StoredGroups = Pick<VisibilityGroup<string>, 'options'>[]

const STORAGE_VERSION = 10

const canToggle = ({ header, enableHiding }: MarketColumnShape) => !!header && enableHiding !== false

const isShownByDefault = ({ header, meta }: MarketColumnShape) => !!header && !meta?.defaultHidden

const isColumnVisible = (column: MarketColumnShape, choices: ColumnChoices) =>
  canToggle(column) ? (choices[column.id] ?? isShownByDefault(column)) : isShownByDefault(column)

export const getColumnVisibility = (columns: readonly MarketColumnShape[], choices: ColumnChoices) =>
  fromEntries(columns.map(column => [column.id, isColumnVisible(column, choices)]))

/** The settings of the visibility popover: one switch per column, named after its header. */
export const getColumnSettings = (
  columns: readonly MarketColumnShape[],
  choices: ColumnChoices,
): VisibilityGroup<MarketColumnId>[] =>
  recordEntries(groupBy(columns.filter(canToggle), ({ meta }) => meta?.settingsGroup ?? '')).map(
    ([label, groupColumns]) => ({
      label,
      options: groupColumns.map(column => ({
        label: String(column.header),
        columns: [column.id as MarketColumnId],
        active: isColumnVisible(column, choices),
        enabled: true,
      })),
    }),
  )

/** Before version 10 the full settings of each variant were stored, only keep what differs from the defaults. */
const migrateGroupsToChoices = (
  storedGroups: StoredGroups | undefined,
  columns: readonly MarketColumnShape[],
): ColumnChoices => {
  const storedOptions = storedGroups?.flatMap(({ options }) => options) ?? []
  return fromEntries(
    columns
      .filter(canToggle)
      .map(column => ({
        id: column.id,
        shownByDefault: isShownByDefault(column),
        active: storedOptions.find(option => option.columns.includes(column.id))?.active,
      }))
      .filter(({ active, shownByDefault }) => active != null && active !== shownByDefault)
      .map(({ id, active }) => [id, active] as const),
  )
}

export const inGroup = <TColumn extends MarketColumnInput>(settingsGroup: string, columns: TColumn[]) =>
  columns.map(column => ({ ...column, meta: { ...column.meta, settingsGroup } }))

/** A table showing markets, its columns are the only source for what is shown, sorted, filtered and toggled. */
export const defineMarketTable = <TColumn extends MarketColumnInput>({
  columns: columnInputs,
  storedVariant,
  ...table
}: {
  testId: string
  defaultSort: SortingState
  sortQueryField: string
  storageKey: string
  /** The variant holding the settings of this table before version 10 */
  storedVariant: string
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
        migrateGroupsToChoices((oldValue as Record<string, StoredGroups | undefined>)[storedVariant], columns),
    } satisfies MigrationOptions<ColumnChoices>,
  }
}
