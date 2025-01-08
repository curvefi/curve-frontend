import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCallback, useMemo, useState } from 'react'
import { FormControlLabel } from '@mui/material'
import { OnChangeFn, VisibilityState } from '@tanstack/react-table'

export type VisibilityOption = {
  id: string
  type: 'column' | 'feature' // columns hide the whole column, features hide a specific feature in a column
  active: boolean
  label: string
}
export type VisibilityGroup = {
  options: VisibilityOption[]
  label: string
}
const { Spacing } = SizesAndSpaces

// when we define columns in nested objects, tanstack replaces dots with underscores internally
export const cleanColumnId = (field: string) => field.replaceAll('.', '_')

/**
 * Dialog that allows to toggle visibility of columns in a table.
 */
export const TableVisibilitySettingsPopover = ({
  visibilityGroups,
  toggleVisibility,
  open,
  onClose,
  anchorEl,
}: {
  open: boolean
  onClose: () => void
  visibilityGroups: VisibilityGroup[]
  toggleVisibility: (id: string) => void
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
      {visibilityGroups.map(({ options, label }) => (
        <Stack key={label} gap={Spacing.md}>
          <Typography variant="headingXsBold" sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}>
            {label}
          </Typography>
          {options.map(({ id, active, label }) => (
            <FormControlLabel
              key={id}
              control={
                <Switch
                  data-testid={`visibility-toggle-${cleanColumnId(id)}`}
                  checked={active}
                  onChange={() => toggleVisibility(id)}
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

const flatten = (columnSettings: VisibilityGroup[], type: VisibilityOption['type']): Record<string, boolean> =>
  columnSettings.reduce(
    (acc, group) => ({
      ...acc,
      ...group.options
        .filter((option) => option.type === type)
        .reduce((acc, { active, id }) => ({ ...acc, [cleanColumnId(id)]: active }), {}),
    }),
    {},
  )

/**
 * Hook to manage column visibility settings. Currently saved in the state.
 */
export const useColumnSettings = (groups: VisibilityGroup[]) => {
  /** current visibility settings in grouped format */
  const [visibilitySettings, setVisibilitySettings] = useState(groups)

  /** toggle visibility of a column by its id */
  const toggleColumnVisibility = useCallback(
    (columnId: string): void =>
      setVisibilitySettings((prev) =>
        prev.map((group) => ({
          ...group,
          options: group.options.map((column) =>
            column.id === columnId ? { ...column, active: !column.active } : column,
          ),
        })),
      ),
    [],
  )

  /** current column visibility state as used internally by tanstack */
  const columnVisibility = useMemo(() => flatten(visibilitySettings, 'column'), [visibilitySettings])

  /** current feature visibility state as used by our custom code */
  const featureVisibility = useMemo(() => flatten(visibilitySettings, 'feature'), [visibilitySettings])

  /** callback to update visibility state by ID, used by tanstack */
  const onColumnVisibilityChange: OnChangeFn<VisibilityState> = useCallback(
    (newVisibility) => {
      const visibility = typeof newVisibility === 'function' ? newVisibility(columnVisibility) : newVisibility
      setVisibilitySettings((prev) =>
        prev.map((category) => ({
          ...category,
          options: category.options.map((column) => ({
            ...column,
            active: visibility[cleanColumnId(column.id)],
          })),
        })),
      )
    },
    [columnVisibility],
  )

  return {
    columnSettings: visibilitySettings,
    columnVisibility,
    featureVisibility,
    onColumnVisibilityChange,
    toggleVisibility: toggleColumnVisibility,
  }
}
