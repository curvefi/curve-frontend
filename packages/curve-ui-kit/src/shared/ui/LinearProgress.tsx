import Box from '@mui/material/Box'

const SIZE_MAPPING = {
  small: 4,
  medium: 8,
  large: 16,
}

export const LinearProgress = ({ percent, size }: { percent: number; size: keyof typeof SIZE_MAPPING }) => (
  <Box
    sx={(t) => ({
      height: SIZE_MAPPING[size],
      background: `linear-gradient(to right, ${t.design.Color.Primary[500]} ${percent}%, ${t.design.Color.Neutral[300]} ${percent}%)`,
    })}
  />
)
