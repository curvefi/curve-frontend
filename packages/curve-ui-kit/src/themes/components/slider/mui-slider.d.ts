/* eslint-disable @typescript-eslint/no-empty-object-type,@typescript-eslint/no-unused-vars */
import '@mui/material/Slider'

type SliderSizes = 'small' | 'medium'
type SliderSizeOverrides = { [key in SliderSizes]: true }

/**
 * The background pattern applied to the rail background.
 *
 * Default: transparent with border
 * Filled: filled with light primary color no border
 * Bordered: light primary color segments with 4 vertical borders
 * Safe: safe color gradient no borders
 * Danger: danger color gradient no borders
 */
type SliderRailBackground = 'default' | 'filled' | 'bordered' | 'safe' | 'danger'

declare module '@mui/material/Slider' {
  interface SliderPropsSizeOverrides extends SliderSizeOverrides {}
  interface SliderOwnProps<Value extends number | number[]> {
    // data-prefix to prevent DOM validation errors
    'data-rail-background'?: SliderRailBackground
  }
}
