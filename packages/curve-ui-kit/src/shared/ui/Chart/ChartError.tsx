import Box from '@mui/material/Box'
import { t } from '@ui-kit/lib/i18n'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'

/** Error message component centered and wrapped in a container that takes a height prop and uses full width.
 * Optional prop for passing a refetch function to refresh the chart */
export const ChartError = ({
  height,
  errorMessage,
  refetchFunction,
}: {
  height: number
  errorMessage: string
  refetchFunction?: () => void
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
      refreshData={refetchFunction}
      errorMessage={errorMessage}
    />
  </Box>
)
