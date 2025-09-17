import '@mui/material/ToggleButton'
import '@mui/material/ToggleButtonGroup'

declare module '@mui/material/ToggleButton' {
  export interface ToggleButtonPropsSizeOverrides {
    extraSmall: true
  }

  export interface ToggleButtonClasses {
    sizeExtraSmall: string
    sizeExtraSmallSquare: string
    sizeSmallSquare: string
    sizeMediumSquare: string
  }

  export interface ToggleButtonPropsSizeOverrides {
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}

declare module '@mui/material/ToggleButtonGroup' {
  export interface ToggleButtonGroupProps {
    compact?: boolean // todo: get rid of this property as it gets passed to the dom and causes errors
  }

  export interface ToggleButtonGroupPropsSizeOverrides {
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}
