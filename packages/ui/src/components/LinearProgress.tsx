import MuiLinearProgress from '@mui/material/LinearProgress'
import { keyframes, type Theme } from '@mui/material/styles'

const SIZE_MAPPING = { small: 4, medium: 8, large: 16 }
const enter = keyframes`
  from { scale: 0 1; }
  to { scale: 1 1; }
`

export const LinearProgress = ({
  percent,
  size,
  barColor,
}: {
  percent: number
  size: keyof typeof SIZE_MAPPING
  barColor?: string | ((t: Theme) => string)
}) => (
  <MuiLinearProgress
    sx={{
      height: SIZE_MAPPING[size],
      '& .MuiLinearProgress-bar': {
        backgroundColor: barColor,
        transformOrigin: t => (t.direction === 'rtl' ? 'right' : 'left'),
        animation: `${enter} 0.4s linear`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      },
    }}
    value={percent}
    variant="determinate"
  />
)
