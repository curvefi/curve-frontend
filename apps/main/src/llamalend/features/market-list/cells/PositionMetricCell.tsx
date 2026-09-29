import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

export const PositionMetricCell = ({
  error,
  hasData,
  value,
  testId,
  valueTestId,
  valueSx,
  support,
}: {
  error?: Error | null
  hasData: boolean
  value: string | undefined
  testId?: string
  valueTestId?: string
  valueSx?: SxProps
  support?: ReactNode
}) => {
  if (error && !hasData) return <ErrorCell error={error} />
  const text = value ?? (hasData ? t`Unavailable` : '')
  return (
    <Stack sx={{ gap: Spacing.xs, alignItems: 'end' }} data-testid={testId}>
      <Typography variant="tableCellMBold" data-testid={valueTestId} sx={valueSx}>
        {text}
      </Typography>
      {support}
    </Stack>
  )
}
