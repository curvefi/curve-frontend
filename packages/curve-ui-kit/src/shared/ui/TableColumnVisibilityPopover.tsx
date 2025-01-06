import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCallback, useMemo, useState } from 'react'
import { FormControlLabel } from '@mui/material'
import { OnChangeFn, VisibilityState } from '@tanstack/react-table'

export type ColumnVisibility = {
  columnId: string
  active: boolean
  label: string
}
export type ColumnVisibilityGroup = {
  columns: ColumnVisibility[]
  label: string
}
const { Spacing } = SizesAndSpaces

// when we define columns in nested objects, tanstack replaces dots with underscores internally
export const cleanColumnId = (field: string) => field.replaceAll('.', '_')

/**
 * Dialog that allows to toggle visibility of columns in a table.
 */
export const TableColumnVisibilityPopover = ({
  columnVisibilityGroups,
  toggleColumnVisibility,
  open,
  onClose,
  anchorEl,
}: {
  open: boolean
  onClose: () => void
  columnVisibilityGroups: ColumnVisibilityGroup[]
  toggleColumnVisibility: (columnId: string) => void
  anchorEl: HTMLButtonElement
}) => (
  <Popover
    open={open}
    onClose={onClose}
    anchorEl={anchorEl}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    slotProps={{
      paper: {
        sx: { padding: Spacing.md },
      },
    }}
  >
    <Stack gap={Spacing.md}>
      {columnVisibilityGroups.map(({ columns, label }) => (
        <Stack key={label} gap={Spacing.md}>
          <Typography variant="headingXsBold" sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}>
            {label}
          </Typography>
          {columns.map(({ columnId, active, label }) => (
            <FormControlLabel
              key={columnId}
              control={
                <Switch
                  data-testid={`visibility-toggle-${cleanColumnId(columnId)}`}
                  checked={active}
                  onChange={() => toggleColumnVisibility(columnId)}
                  size="small"
                />
              }
              label={label}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  </Popover>
)

/**
 * Hook to manage column visibility settings. Currently saved in the state.
 */
export const useColumnSettings = (groups: ColumnVisibilityGroup[]) => {
  /** current visibility settings in grouped format */
  const [columnSettings, setColumnSettings] = useState(groups)

  /** toggle visibility of a column by its id */
  const toggleColumnVisibility = useCallback(
    (columnId: string): void =>
      setColumnSettings((prev) =>
        prev.map((group) => ({
          ...group,
          columns: group.columns.map((column) =>
            column.columnId === columnId ? { ...column, active: !column.active } : column,
          ),
        })),
      ),
    [],
  )

  /** current visibility state as used internally by tanstack */
  const columnVisibility: Record<string, boolean> = useMemo(
    () =>
      columnSettings.reduce(
        (acc, group) => ({
          ...acc,
          ...group.columns.reduce((acc, column) => ({ ...acc, [cleanColumnId(column.columnId)]: column.active }), {}),
        }),
        {},
      ),
    [columnSettings],
  )

  /** callback to update visibility state by ID, used by tanstack */
  const onColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback(
    (newVisibility) => {
      const visibility = typeof newVisibility === 'function' ? newVisibility(columnVisibility) : newVisibility
      setColumnSettings((prev) =>
        prev.map((category) => ({
          ...category,
          columns: category.columns.map((column) => ({
            ...column,
            active: visibility[cleanColumnId(column.columnId)],
          })),
        })),
      )
    },
    [columnVisibility],
  )

  return { columnSettings, columnVisibility, onColumnVisibilityChange, toggleColumnVisibility }
}
