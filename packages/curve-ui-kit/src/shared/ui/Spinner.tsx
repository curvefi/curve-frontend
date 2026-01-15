import CircularProgress from '@mui/material/CircularProgress'
import type { SxProps } from '@ui-kit/utils'

type SpinnerProps = {
  /** Whether to inherit theme color or use secondary text color. Defaults to false. */
  useTheme?: boolean
  size?: number
  sx?: SxProps
}

export const Spinner = ({ useTheme = false, size = 20, sx }: SpinnerProps) => (
  <CircularProgress
    size={size}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      color: useTheme ? (theme) => theme.palette.text.secondary : 'inherit',
      ...sx,
    }}
  />
)
