import { type ChangeEvent, ReactNode } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const CheckboxField = ({
  checked,
  label,
  description,
  testIdPrefix,
  onChange,
  endContent,
  collapsible,
  disabled,
}: {
  checked: boolean
  label: ReactNode
  /** Secondary text displayed under the label */
  description?: ReactNode
  disabled?: boolean
  testIdPrefix?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  /** Supplementary content (e.g., preview value, settings) displayed at the end of the checkbox row. */
  endContent?: ReactNode
  /** Collapsible content displayed when the checkbox is checked. */
  collapsible?: ReactNode
}) => (
  <Stack>
    <Stack
      direction="row"
      sx={{ justifyContent: 'space-between', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <FormControlLabel
        // with default margin, the checkbox overflows. With a description, the checkbox aligns with the label
        sx={{ margin: 0, ...(description && { alignItems: 'flex-start' }) }}
        label={
          <Stack sx={{ userSelect: 'none' }}>
            <Typography variant="bodyMBold">{label}</Typography>
            {description && (
              <Typography variant="bodyXsRegular" color="textSecondary">
                {description}
              </Typography>
            )}
          </Stack>
        }
        control={
          <Checkbox
            data-testid={testIdPrefix && `${testIdPrefix}-checkbox`}
            size="small"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            sx={{ padding: 0, paddingInlineEnd: Spacing.xs }}
          />
        }
      />
      {endContent}
    </Stack>
    {collapsible && <Collapse in={checked}>{collapsible}</Collapse>}
  </Stack>
)
