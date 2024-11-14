declare module 'global' {
  module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
      outlined: true
      contained: true
      ghost: true

      text: false
    }

    interface ButtonPropsColorOverrides {
      primary: true
      secondary: true
      navigation: true
      success: true
      alert: true

      error: false
      info: false
      warning: false
    }
  }
}
