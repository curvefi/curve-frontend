import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import Box from '@mui/material/Box'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

/** Error message component centered and wrapped in a container that takes a height prop and uses full width.
 * Optional callback for refreshing the chart data. */
export const ChartError = ({
  height,
  error,
  errorMessage,
  refreshData,
  userAddress,
}: {
  height: number
  error: Error
  errorMessage: string
  refreshData?: () => Promise<unknown> | void
  userAddress: Address | undefined
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
    <ErrorMessage
      title={t`An error occurred`}
      subtitle={errorMessage}
      error={error}
      refreshData={refreshData}
      userAddress={userAddress}
    />
  </Box>
)
