import '@mui/material/Slider'

type SliderSizes = 'small' | 'medium' | 'large'
type SliderSizeOverrides = { [key in SliderSizes]: true }

declare module '@mui/material/Slider' {
  interface SliderPropsSizeOverrides extends SliderSizeOverrides {}
}
