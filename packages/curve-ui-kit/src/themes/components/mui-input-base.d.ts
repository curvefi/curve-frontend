import '@mui/material/InputBase'
import '@mui/material/InputLabel'
import '@mui/material/TextField'

declare module '@mui/material/InputBase' {
  export interface InputBasePropsSizeOverrides {
    extraSmall: true
  }

  export interface InputBaseClasses {
    sizeExtraSmall: string
  }
}

declare module '@mui/material/InputLabel' {
  export interface InputLabelPropsSizeOverrides {
    extraSmall: true
  }

  export interface InputLabelClasses {
    sizeExtraSmall: string
  }
}

declare module '@mui/material/TextField' {
  export interface TextFieldPropsSizeOverrides {
    extraSmall: true
  }

  export interface TextFieldPropsSizeOverrides {
    sizeExtraSmall: string
  }
}
