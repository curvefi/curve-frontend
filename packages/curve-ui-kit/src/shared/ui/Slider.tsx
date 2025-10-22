import clsx from 'clsx'
import { Box } from '@mui/material'
import MuiSlider, { type SliderProps as MuiSliderProps } from '@mui/material/Slider'
import { SLIDER_RAIL_BACKGROUND_CLASSES } from '@ui-kit/themes/components/slider'

type RailBackground = 'default' | 'bordered' | 'safe' | 'danger'

export interface SliderProps extends MuiSliderProps {
  railBackground?: RailBackground
}

/**
 * Slider component built on top of MUI Slider component
 * @param props - SliderProps
 * @returns Slider component with custom rail background and flex wrapper to prevent height issues and overflows
 */
export const Slider = (props: SliderProps) => {
  const { railBackground = 'default', className, ...muiProps } = props

  const railClass = (() => {
    if (railBackground === 'bordered') return SLIDER_RAIL_BACKGROUND_CLASSES.bordered
    if (railBackground === 'safe') return SLIDER_RAIL_BACKGROUND_CLASSES.safe
    if (railBackground === 'danger') return SLIDER_RAIL_BACKGROUND_CLASSES.danger
    return undefined
  })()

  return (
    <Box
      sx={{
        width: '100%',
        // we need this to prevent height issues and overflows
        display: 'flex',
      }}
    >
      <MuiSlider className={clsx(className, railClass)} {...muiProps} />
    </Box>
  )
}
