import { useEffect, useState } from 'react'
import MuiLinearProgress from '@mui/material/LinearProgress'
import { type Theme } from '@mui/material/styles'

const SIZE_MAPPING = {
  small: 4,
  medium: 8,
  large: 16,
}

export const LinearProgress = ({
  percent,
  size,
  barColor,
}: {
  percent: number
  size: keyof typeof SIZE_MAPPING
  barColor?: string | ((t: Theme) => string)
}) => {
  const [value, setValue] = useState(0)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setValue(percent), [percent]) // set value via effect so it animates on load
  return (
    <MuiLinearProgress
      sx={{
        height: SIZE_MAPPING[size],
        '& .MuiLinearProgress-bar': { backgroundColor: barColor },
      }}
      value={value}
      variant="determinate"
    />
  )
}
