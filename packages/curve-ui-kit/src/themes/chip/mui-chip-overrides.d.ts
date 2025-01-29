declare module '@mui/material/Chip/Chip' {
  export interface ChipPropsColorOverrides {
    // used both for badges and chips
    active: true

    // colors usually for badges
    alert: true
    default: true
    highlight: true
    warning: true
    accent: true

    // colors usually for chips
    inactive: true
  }

  export interface ChipPropsSizeOverrides {
    extraSmall: true
    small: true
    medium: true
    large: true
    extraLarge: true
  }

  export interface ChipPropsVariantOverrides {
    badge: true
    chip: true
    filled: false
    outlined: false
  }
}
