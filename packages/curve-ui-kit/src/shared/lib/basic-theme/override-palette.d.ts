declare module 'global' {
  declare module '@mui/material/styles' {
    interface Color {
      10: string
      25: string
      75: string
      150: string
      750: string
      850: string
      950: string
      975: string
    }

    interface Palette {
      neutral: PaletteColor
      tertiary: PaletteColor
      green: PartialColor
      violet: PartialColor
      red: PartialColor
      blue: PartialColor
    }

    interface PaletteOptions {
      neutral: PaletteColorOptions
      tertiary: PaletteColorOptions
      green: PartialColor
      violet: PartialColor
      red: PartialColor
      blue: PartialColor
    }
  }
}
