import Stack from '@mui/material/Stack'
import { CircleIcon } from '../shared/icons/CircleIcon'

const Circle = () => <CircleIcon sx={{ width: '0.5rem', height: '0.5rem', fill: 'currentColor' }} />

/**
 * A vertical track with two circles at the ends and a dotted line in between, used to represent a route.
 */
export const RouteTrack = () => (
  <Stack
    direction="column"
    justifyContent="center"
    alignItems="center"
    sx={{ marginBlock: '6px 14px', opacity: '0.7' }} // aligns with the 1st and last items
  >
    <Circle />
    <Stack sx={{ borderLeft: '2px dotted', height: '100%', opacity: '0.5' }} />
    <Circle />
  </Stack>
)
