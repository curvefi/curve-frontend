import { Box } from '@mui/material'
import MuiSlider, { type SliderProps as MuiSliderProps } from '@mui/material/Slider'
export type SliderProps = MuiSliderProps

/**
 * Slider component built on top of MUI Slider component
 * @param props - SliderProps
 * @returns Slider component with custom rail background and flex wrapper to prevent height issues and overflows
 */
export const Slider = (props: SliderProps) => (
  <Box
    sx={{
      width: props.orientation === 'horizontal' ? '100%' : 'auto',
      // we need this to prevent height issues and overflows
      height: props.orientation === 'horizontal' ? 'auto' : '100%',
      display: 'flex',
    }}
  >
    <MuiSlider {...props} />
  </Box>
)
