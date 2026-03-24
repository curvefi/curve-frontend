import { Box } from '@mui/material'
import { Spinner } from '@ui-kit/shared/ui/Spinner'

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
