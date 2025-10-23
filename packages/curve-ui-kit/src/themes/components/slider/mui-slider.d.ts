import '@mui/material/Slider'

type SliderSizes = 'small' | 'medium'
type SliderSizeOverrides = { [key in SliderSizes]: true }

export type SliderRailBackground = 'default' | 'bordered' | 'safe' | 'danger'

declare module '@mui/material/Slider' {
  interface SliderPropsSizeOverrides extends SliderSizeOverrides {}
  interface SliderOwnProps<Value extends number | number[]> {
    railBackground?: SliderRailBackground
  }
}
