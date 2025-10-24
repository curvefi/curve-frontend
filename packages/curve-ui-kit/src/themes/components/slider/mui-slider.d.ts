import '@mui/material/Slider'

type SliderSizes = 'small' | 'medium'
type SliderSizeOverrides = { [key in SliderSizes]: true }

type SliderRailBackground = 'default' | 'bordered' | 'safe' | 'danger'

declare module '@mui/material/Slider' {
  interface SliderPropsSizeOverrides extends SliderSizeOverrides {}
  interface SliderOwnProps<Value extends number | number[]> {
    // kebab-case instead of camelCase to prevent validation errors from react in the DOM
    'data-rail-background'?: SliderRailBackground
  }
}
