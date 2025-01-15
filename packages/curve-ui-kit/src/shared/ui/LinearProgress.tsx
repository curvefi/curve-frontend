import MuiLinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress'
import { useEffect, useState } from 'react'

const SIZE_MAPPING = {
  small: 4,
  medium: 8,
  large: 16,
}

export const LinearProgress = ({ percent, size }: { percent: number; size: keyof typeof SIZE_MAPPING }) => {
  const [value, setValue] = useState(0)
  useEffect(() => setValue(percent), [percent]) // set value via effect so it animates on load
  return <MuiLinearProgress sx={{ height: SIZE_MAPPING[size] }} value={value} variant="determinate" />
}
