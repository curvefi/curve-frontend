import type { RefObject } from 'react'
import { FormControlLabel } from '@mui/material'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { VisibilityGroup } from './visibility.types'

const { Spacing } = SizesAndSpaces

/**
 * Dialog that allows to toggle visibility of columns in a table.
 */
export const TableVisibilitySettingsPopover = <ColumnIds extends string>({
  visibilityGroups,
  toggleVisibility,
  open,
  onClose,
  anchorRef: { current: anchorEl },
}: {
  open: boolean
  onClose: () => void
  visibilityGroups: VisibilityGroup<ColumnIds>[]
  toggleVisibility: (columns: string[]) => void
  anchorRef: RefObject<HTMLButtonElement | null>
}) =>
  anchorEl && (
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
        {visibilityGroups
          .filter(({ options }) => options.some((o) => o.enabled))
          .map(({ options, label }) => (
            <Stack key={label} gap={Spacing.sm}>
              <Typography
                variant="headingXsBold"
                sx={{ paddingBottom: Spacing.xs, borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}` }}
              >
                {label}
              </Typography>
              {options
                .filter((option) => option.enabled)
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
