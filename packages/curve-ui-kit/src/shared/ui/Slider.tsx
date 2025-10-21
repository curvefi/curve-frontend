import MuiSlider, { type SliderProps as MuiSliderProps } from '@mui/material/Slider'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'

export type SliderVariant = 'default' | 'inputs'
export type SliderOrientation = 'horizontal' | 'vertical'
export type RailBackgroundColors = 'default' | 'trading' | 'bordered'
export type SliderType = 'linear' | 'log'
export type InputsOrientation = 'row' | 'column'

export interface SliderProps extends Omit<MuiSliderProps, 'orientation'> {
  variant?: SliderVariant
  orientation?: SliderOrientation
  railBackground?: RailBackgroundColors
  type?: SliderType
  inputsOrientation?: InputsOrientation
  sx?: SxProps<Theme>
}

const getRailBackground = (args: {
  railBackground: RailBackgroundColors
  orientation: SliderOrientation
}): SxProps<Theme> => {
  const { railBackground, orientation } = args
  const isVertical = orientation === 'vertical'

  const trading = (theme: Theme) => {
    const dir = isVertical ? 'to top' : 'to right'
    const tradingColors = theme.design.Sliders.SliderBackground.Trading
    return {
      '& .MuiSlider-rail': {
        backgroundImage: `linear-gradient(${dir}, ${tradingColors[25]} 0%, ${tradingColors[25]} 25%, ${tradingColors[50]} 25%, ${tradingColors[50]} 50%, ${tradingColors[75]} 50%, ${tradingColors[75]} 75%, ${tradingColors[100]} 75%, ${tradingColors[100]} 100%)`,
        opacity: 1,
      },
    }
  }

  const bordered = (theme: Theme) => {
    const dir = isVertical ? 'to top' : 'to right'
    const seg = theme.design.Color.Primary[200]
    const line = theme.design.Color.Neutral[500]
    const segments = `linear-gradient(${dir}, ${seg} 0%, ${seg} 25%, ${seg} 25%, ${seg} 50%, ${seg} 50%, ${seg} 75%, ${seg} 75%, ${seg} 100%)`
    const borders = `repeating-linear-gradient(${dir}, transparent 0, transparent calc(25% - 1px), ${line} calc(25% - 1px), ${line} 25%)`
    return {
      '& .MuiSlider-rail': {
        backgroundImage: `${borders}, ${segments}`,
        opacity: 1,
      },
    }
  }

  if (railBackground === 'trading') return trading
  if (railBackground === 'bordered') return bordered
  return (theme: Theme) => ({
    '& .MuiSlider-rail': {
      border: `1px solid ${theme.design.Color.Neutral[500]}`,
      opacity: 1,
    },
  })
}

const buildSliderSx = (props: {
  railBackground: RailBackgroundColors
  orientation: SliderOrientation
  baseSx?: SxProps<Theme>
}): SxProps<Theme> => {
  const { railBackground, orientation, baseSx } = props
  const rail = getRailBackground({ railBackground, orientation })
  const first = (theme: Theme): SystemStyleObject<Theme> => {
    const railResolved: SystemStyleObject<Theme> =
      typeof rail === 'function'
        ? (rail as (theme: Theme) => SystemStyleObject<Theme>)(theme)
        : (rail as SystemStyleObject<Theme>)
    return {
      '& .MuiSlider-rail': {
        backgroundColor: 'transparent',
      },
      ...railResolved,
    }
  }
  const arrayBase: readonly SxProps<Theme>[] = baseSx
    ? Array.isArray(baseSx)
      ? [first, ...baseSx]
      : [first, baseSx]
    : [first]
  return arrayBase as SxProps<Theme>
}
/**
 * Slider component built on top of MUI Slider component
 * @param props - SliderProps
 * @returns Slider component
 */
export const Slider = (props: SliderProps) => {
  const {
    variant = 'default',
    orientation = 'horizontal',
    railBackground = 'default',
    // scaleType = 'linear',
    inputsOrientation = 'row',
    sx,
    value,
    defaultValue,
    ...muiProps
  } = props

  const sliderEl = (
    <MuiSlider
      orientation={orientation}
      sx={buildSliderSx({ railBackground, orientation, baseSx: sx })}
      {...muiProps}
      value={value as any}
      defaultValue={defaultValue as any}
    />
  )

  return <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>{sliderEl}</Box>
}
