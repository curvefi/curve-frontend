import { type ChangeEvent, ReactNode } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Spinner } from '@ui/components/Spinner'
import { type QueryOrValue, toQuery } from '@ui/features/queries/util'
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
  disabled = false,
}: {
  /** A query shows a spinner and disables the checkbox while loading, and an error icon when it fails */
  checked: QueryOrValue<boolean | undefined>
  label: ReactNode
  /** Helper text displayed below the label when the checkbox is checked. */
  description?: ReactNode
  disabled?: boolean
  testIdPrefix?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  /** Supplementary content (e.g., preview value, settings) displayed at the end of the checkbox row. */
  endContent?: ReactNode
  /** Collapsible content displayed when the checkbox is checked. */
  collapsible?: ReactNode
}) => {
  const { data, isLoading, error } = toQuery(checked)
  return (
    <Stack>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', gap: Spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}
      >
        {/* the status icons stay outside the label, so clicking them does not toggle the checkbox */}
        <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
          <FormControlLabel
            // with default margin, the checkbox overflows. With a description, the checkbox aligns with the label
            sx={{ margin: 0, ...(description && { alignItems: 'flex-start' }) }}
            label={
              <Stack sx={{ userSelect: 'none' }}>
                <Typography variant="bodyMBold">{label}</Typography>
                {description && (
                  <Collapse in={!!data}>
                    <Typography variant="bodyXsRegular" color="textSecondary">
                      {description}
                    </Typography>
                  </Collapse>
                )}
              </Stack>
            }
            control={
              <Checkbox
                data-testid={testIdPrefix && `${testIdPrefix}-checkbox`}
                size="small"
                disabled={disabled || isLoading}
                checked={!!data}
                onChange={onChange}
                sx={{ padding: 0, paddingInlineEnd: Spacing.xs }}
              />
            }
          />
          {isLoading && <Spinner size={16} sx={{ margin: 0 }} />}
          {error && <ErrorIconButton error={error} size="extraSmall" />}
        </Stack>
        {endContent}
      </Stack>
      {collapsible && <Collapse in={!!data}>{collapsible}</Collapse>}
    </Stack>
  )
}
