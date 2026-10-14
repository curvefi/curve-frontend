import { CheckedIcon } from '@ui/icons/CheckedIcon'
import { CrossCircleIcon } from '@ui/icons/CrossCircleIcon'

export const VoteMarker = ({ supports }: { supports: boolean }) =>
  supports ? (
    <CheckedIcon sx={{ fontSize: 16, color: 'var(--chart-green)' }} />
  ) : (
    <CrossCircleIcon sx={{ fontSize: 16, color: 'var(--chart-red)' }} />
  )
