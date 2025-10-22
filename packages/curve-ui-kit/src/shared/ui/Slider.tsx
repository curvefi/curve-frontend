import clsx from 'clsx'
import { Box } from '@mui/material'
import MuiSlider, { type SliderProps as MuiSliderProps } from '@mui/material/Slider'
import { SLIDER_RAIL_BACKGROUND_CLASSES } from '@ui-kit/themes/components/slider'

export type SliderVariant = 'default' | 'inputs'
export type SliderOrientation = 'horizontal' | 'vertical'
export type RailBackground = 'default' | 'bordered' | 'safe' | 'danger'
export type SliderType = 'linear' | 'log'
export type InputsOrientation = 'row' | 'column'

export interface SliderProps extends Omit<MuiSliderProps, 'orientation'> {
  variant?: SliderVariant
  orientation?: SliderOrientation
  railBackground?: RailBackground
  type?: SliderType
  inputsOrientation?: InputsOrientation
}

/**
 * Slider component built on top of MUI Slider component
 * @param props - SliderProps
 * @returns Slider component
 */
export const Slider = (props: SliderProps) => {
  const {
    variant: _variant = 'default',
    orientation = 'horizontal',
    railBackground = 'default',
    type: _type = 'linear',
    inputsOrientation: _inputsOrientation = 'row',
    sx,
    className,
    value,
    defaultValue,
    size,
    ...muiProps
  } = props

  const railClass = (() => {
    if (railBackground === 'bordered') return SLIDER_RAIL_BACKGROUND_CLASSES.bordered
    if (railBackground === 'safe') return SLIDER_RAIL_BACKGROUND_CLASSES.safe
    if (railBackground === 'danger') return SLIDER_RAIL_BACKGROUND_CLASSES.danger
    return undefined
  })()

  const sliderEl = (
    <MuiSlider
      orientation={orientation}
      className={clsx(className, railClass)}
      sx={sx}
      size={size}
      {...muiProps}
      value={value as any}
      defaultValue={defaultValue as any}
    />
  )

  return <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{sliderEl}</Box>
}
