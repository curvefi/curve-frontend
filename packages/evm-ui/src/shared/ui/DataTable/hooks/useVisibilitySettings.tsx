import { isEqual } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useTableColumnVisibility } from '@evm-ui/hooks/useLocalStorage'
import type { MigrationOptions } from '@evm-ui/hooks/useStoredState'
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

/** Keep the user's visibility choices while treating labels and availability as live presentation metadata. */
const withCurrentMetadata = <ColumnIds extends string>(
  storedGroups: VisibilityGroup<ColumnIds>[] | undefined,
  currentGroups: VisibilityGroup<ColumnIds>[],
) => {
  const storedOptions = storedGroups?.flatMap(group => group.options) ?? []
  return currentGroups.map(group => ({
    ...group,
    options: group.options.map(option => ({
      ...option,
      active: storedOptions.find(stored => isEqual(stored.columns, option.columns))?.active ?? option.active,
    })),
  }))
}

/**
 * Hook to manage column and feature visibility settings. Currently saved in the state.
 *
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
export const useVisibilitySettings = <TVariant extends string, ColumnIds extends string>(
  tableTitle: string,
  groups: Record<TVariant, VisibilityGroup<ColumnIds>[]>,
  variant: TVariant,
  columns: readonly { id?: string; meta?: { hidden?: boolean } }[],
  migration: MigrationOptions<Record<TVariant, VisibilityGroup<ColumnIds>[]>>,
) => {
  /** current visibility settings in grouped format */
  const [visibilitySettings, setVisibilitySettings] = useTableColumnVisibility(tableTitle, groups, migration)

  /** toggle visibility of a column by its id */
  const toggleVisibility = useCallback(
    (columns: string[]): void =>
      setVisibilitySettings(prev => ({
        ...prev,
        [variant]: withCurrentMetadata(prev[variant], groups[variant]).map(group => ({
          ...group,
          options: group.options.map(option =>
            isEqual(option.columns, columns) ? { ...option, active: !option.active } : option,
          ),
        })),
      })),
    [groups, setVisibilitySettings, variant],
  )

  const columnSettings = useMemo(
    () => withCurrentMetadata(visibilitySettings[variant], groups[variant]),
    [groups, variant, visibilitySettings],
  )
  /** current column visibility state as used internally by tanstack */
  const columnVisibility = useMemo(
    () =>
      ({
        ...flatten(columnSettings),
        ...Object.fromEntries(columns.filter(c => c.meta?.hidden).map(c => [c.id, false])),
      }) as Record<ColumnIds, boolean>,
    [columnSettings, columns],
  )

  return { columnSettings, columnVisibility, toggleVisibility }
}
