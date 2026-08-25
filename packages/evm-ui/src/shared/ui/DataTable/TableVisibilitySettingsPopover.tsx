import type { RefObject } from 'react'
import { useTransitionTestId } from '@evm-ui/hooks/useTransitionTestId'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils'
import { FormControlLabel } from '@mui/material'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
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
}) => {
  const { transition, props } = useTransitionTestId('table-visibility-settings-popover')
  if (!anchorEl) return
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          ...{ 'data-testid': 'table-visibility-settings-popover-root' },
          sx: { padding: Spacing.md },
        },
        transition,
      }}
    >
      <Stack sx={{ gap: Spacing.md }} {...props}>
        {visibilityGroups
          .filter(({ options }) => options.some(o => o.enabled))
          .map(({ options, label }) => (
            <Stack key={label} sx={{ gap: Spacing.sm }}>
              <Typography variant="headingXsBold" sx={{ paddingBottom: Spacing.xs, borderBottom: borderStyle }}>
                {label}
              </Typography>
              {options
                .filter(option => option.enabled)
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
}
