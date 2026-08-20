import { t } from '@evm-ui/lib/i18n'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import Box from '@mui/material/Box'

/** Error message component centered and wrapped in a container that takes a height prop and uses full width.
 * Optional callback for refreshing the chart data. */
export const ChartError = ({
  height,
  error,
  errorMessage,
  refreshData,
}: {
  height: number
  error: Error
  errorMessage: string
  refreshData?: () => Promise<unknown> | void
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: height,
    }}
  >
    <ErrorMessage title={t`An error occurred`} subtitle={errorMessage} error={error} refreshData={refreshData} />
  </Box>
)
