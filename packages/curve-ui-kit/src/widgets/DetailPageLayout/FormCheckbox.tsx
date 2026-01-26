import { type ChangeEvent, ReactNode } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const FormCheckbox = ({
  checked,
  label,
  message,
  isLoading,
  error,
  testIdPrefix,
  onChange,
  rightChildren,
  children,
  disabled,
}: {
  checked: boolean
  label: ReactNode
  message?: ReactNode
  isLoading?: boolean
  disabled?: boolean
  error?: Error | null | undefined
  testIdPrefix?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  rightChildren?: ReactNode
  children?: ReactNode
}) => (
  <Stack>
    <Stack direction="row" justifyContent="space-between" gap={Spacing.sm} alignItems="start" flexWrap="wrap">
      <FormControlLabel
        sx={{ minWidth: 180, margin: 0 }}
        label={
          <>
            <Typography variant="headingXsBold">{label}</Typography>
            {message && (
              <WithSkeleton loading={!!isLoading}>
                <Typography {...(error && { color: 'error.main' })} variant="bodyXsRegular">
                  {message}
                </Typography>
              </WithSkeleton>
            )}
          </>
        }
        control={
          <Checkbox
            data-testid={testIdPrefix && `${testIdPrefix}-checkbox`}
            size="small"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            sx={{ padding: 0, paddingInlineEnd: Spacing.xs, alignSelf: 'start' }}
          />
        }
      />
      {rightChildren}
    </Stack>
    {children && <Collapse in={checked}>{children}</Collapse>}
  </Stack>
)
