import { Spinner } from '@evm-ui/shared/ui/Spinner'
import { Box } from '@mui/material'

/** Spinner centered and wrapped in a container that takes a height prop and uses full width. */
export const ChartLoading = ({ height }: { height: number }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: height,
    }}
  >
    <Spinner />
  </Box>
)
