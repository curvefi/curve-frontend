import '@mui/material/Slider'

declare module '@mui/material/Slider' {
  export interface SliderPropsSizeOverrides {
    /**
     * Disabled to prevent confusion between Figma small and MUI's own small
     * as we have no use case for small
     */
    small: false
    /** Medium size in our system (maps to small in Figma) */
    medium: true
    /** Large size in our system (maps to medium in Figma) */
    large: true
  }

  export interface SliderClasses {
    sizeMedium: string
    sizeLarge: string
  }
}
