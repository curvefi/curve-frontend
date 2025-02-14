import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCallback, useMemo, useState } from 'react'
import { FormControlLabel } from '@mui/material'

export type VisibilityOption = {
  id: string
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
        <Stack key={label} gap={Spacing.sm}>
          <Typography
            variant="headingXsBold"
            sx={{ paddingBottom: Spacing.xs, borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
          >
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

/**
 * Converts a grouped visibility settings object to a flat object with column ids as keys and visibility as values.
 */
const flatten = (visibilitySettings: VisibilityGroup[]): Record<string, boolean> =>
  visibilitySettings.reduce(
    (acc, group) => ({
      ...acc,
      ...group.options.reduce((acc, { active, id }) => ({ ...acc, [cleanColumnId(id)]: active }), {}),
    }),
    {},
  )

/**
 * Hook to manage column and feature visibility settings. Currently saved in the state.
 */
export const useVisibilitySettings = (groups: VisibilityGroup[]) => {
  /** current visibility settings in grouped format */
  const [visibilitySettings, setVisibilitySettings] = useState(groups)

  /** toggle visibility of a column by its id */
  const toggleColumnVisibility = useCallback(
    (id: string): void =>
      setVisibilitySettings((prev) =>
        prev.map((group) => ({
          ...group,
          options: group.options.map((option) => (option.id === id ? { ...option, active: !option.active } : option)),
        })),
      ),
    [],
  )

  /** current column visibility state as used internally by tanstack */
  const columnVisibility = useMemo(() => flatten(visibilitySettings), [visibilitySettings])

  return {
    columnSettings: visibilitySettings,
    columnVisibility,
    toggleVisibility: toggleColumnVisibility,
  }
}
