declare module 'global' {
  module '@mui/material' {
    interface BreakpointOverrides {
      xs: false
      sm: false
      md: false
      lg: false
      xl: false
      mobile: true
      tablet: true
      desktop: true
    }
  }
}
