import '@mui/material/ToggleButton'
import '@mui/material/ToggleButtonGroup'

declare module '@mui/material/ToggleButton' {
  export type ToggleButtonClasses = {
    sizeExtraSmall: string
    sizeExtraSmallSquare: string
    sizeSmallSquare: string
    sizeMediumSquare: string
  }

  export type ToggleButtonPropsSizeOverrides = {
    extraSmall: true
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}

declare module '@mui/material/ToggleButtonGroup' {
  export type ToggleButtonGroupProps = {
    compact?: boolean // todo: get rid of this property as it gets passed to the dom and causes errors
  }

  export type ToggleButtonGroupPropsSizeOverrides = {
    extraSmall: true
    extraSmallSquare: true
    smallSquare: true
    mediumSquare: true
  }
}
