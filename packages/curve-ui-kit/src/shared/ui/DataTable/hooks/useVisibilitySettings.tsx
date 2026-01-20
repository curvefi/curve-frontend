import { isEqual } from 'lodash'
import { useCallback, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTableColumnVisibility } from '@ui-kit/hooks/useLocalStorage'
import type { MigrationOptions } from '@ui-kit/hooks/useStoredState'
import type { VisibilityGroup } from '../visibility.types'

/**
 * Converts a grouped visibility settings object to a flat object with column ids as keys and visibility as values.
 */
const flatten = <ColumnIds extends string>(visibilitySettings: VisibilityGroup<ColumnIds>[]): Record<string, boolean> =>
  visibilitySettings.reduce(
    (acc, group) => ({
      ...acc,
      ...group.options.reduce(
        (acc, { active, enabled, columns }) => ({
          ...acc,
          ...columns.reduce((acc, id) => ({ ...acc, [id]: active && enabled }), {}),
        }),
        {},
      ),
    }),
    {},
  )

/**
 * Hook to manage column and feature visibility settings. Currently saved in the state.
 *
 * @template Data - The data type of the table rows.
 * @template Variant - The variant type for visibility settings.
 * @template ColumnIds - The type of column identifiers.
 * @param tableTitle - The title of the table, used as a key for local storage.
 * @param groups - The visibility groups for all the different variants (visibility might be e.g. different in mobile).
 * @param variant - The current variant for which visibility settings are applied.
 * @param columns - The column definitions for the table.
 * @param migration - Migration options for stored visibility settings.
 * @returns An object containing the current column settings, column visibility state, and a function to
 * toggle visibility of columns.
 */
export const useVisibilitySettings = <TData, TVariant extends string, ColumnIds extends string>(
  tableTitle: string,
  groups: Record<TVariant, VisibilityGroup<ColumnIds>[]>,
  variant: TVariant,
  columns: ColumnDef<TData, unknown>[],
  migration: MigrationOptions<Record<TVariant, VisibilityGroup<ColumnIds>[]>>,
) => {
  /** current visibility settings in grouped format */
  const [visibilitySettings, setVisibilitySettings] = useTableColumnVisibility(tableTitle, groups, migration)

  /** toggle visibility of a column by its id */
  const toggleVisibility = useCallback(
    (columns: string[]): void =>
      setVisibilitySettings((prev) => ({
        ...prev,
        [variant]: prev[variant].map((group) => ({
          ...group,
          options: group.options.map((option) =>
            isEqual(option.columns, columns) ? { ...option, active: !option.active } : option,
          ),
        })),
      })),
    [setVisibilitySettings, variant],
  )

  const columnSettings = visibilitySettings[variant]
  /** current column visibility state as used internally by tanstack */
  const columnVisibility = useMemo(
    () =>
      ({
        ...flatten(columnSettings),
        ...Object.fromEntries(columns.filter((c) => c.meta?.hidden).map((c) => [c.id, false])),
      }) as Record<ColumnIds, boolean>,
    [columnSettings, columns],
  )

  return { columnSettings, columnVisibility, toggleVisibility }
}
