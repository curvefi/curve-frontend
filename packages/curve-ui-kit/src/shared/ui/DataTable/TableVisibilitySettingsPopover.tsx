import { useCallback, useEffect, useMemo, useState } from 'react'
import { FormControlLabel } from '@mui/material'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

export type VisibilityOption<ColumnIds> = {
  columns: ColumnIds[] // the column ids that are affected by this option
  active: boolean // whether the column is currently visible in the table
  label?: string // the label for the popover, without a label the option is not shown
  enabled: boolean // whether the column can be currently used
}
export type VisibilityGroup<ColumnIds> = {
  options: VisibilityOption<ColumnIds>[]
  label: string
}
const { Spacing } = SizesAndSpaces

/**
 * Dialog that allows to toggle visibility of columns in a table.
 */
export const TableVisibilitySettingsPopover = <ColumnIds extends string>({
  visibilityGroups,
  toggleVisibility,
  open,
  onClose,
  anchorEl,
}: {
  open: boolean
  onClose: () => void
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility: (columns: string[]) => void
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
          {options
            .filter((option) => option.label)
            .map(
              ({ columns, active, label, enabled }) =>
                enabled && (
                  <FormControlLabel
                    key={columns.join(',')}
                    control={
                      <Switch
                        data-testid={`visibility-toggle-${columns.join(',')}`}
                        checked={active}
                        onChange={() => toggleVisibility(columns)}
                        size="small"
                      />
                    }
                    label={label}
                  />
                ),
            )}
        </Stack>
      ))}
    </Stack>
  </Popover>
)

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
 */
export const useVisibilitySettings = <ColumnIds extends string>(groups: VisibilityGroup<ColumnIds>[]) => {
  /** current visibility settings in grouped format */
  const [visibilitySettings, setVisibilitySettings] = useState(groups)

  useEffect(() => {
    // reset visibility settings when groups change, e.g. when connecting the wallet
    setVisibilitySettings(groups)
  }, [groups])

  /** toggle visibility of a column by its id */
  const toggleVisibility = useCallback(
    (columns: string[]): void =>
      setVisibilitySettings((prev) =>
        prev.map((group) => ({
          ...group,
          options: group.options.map((option) =>
            option.columns === columns ? { ...option, active: !option.active } : option,
          ),
        })),
      ),
    [],
  )

  /** current column visibility state as used internally by tanstack */
  const columnVisibility = useMemo(() => flatten(visibilitySettings), [visibilitySettings])

  return { columnSettings: visibilitySettings, columnVisibility, toggleVisibility }
}
