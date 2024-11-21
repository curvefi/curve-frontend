import {
  TypeBackground as MuiTypeBackground,
  PaletteOptions as MuiPaletteOptions,
  PaletteColor as MuiPaletteColor, PaletteColorOptions as MuiPaletteColorOptions, PaletteColorOptions
} from '@mui/material/styles/createPalette'


declare module '@mui/material/styles/createPalette' {
  export interface TypeBackground extends MuiTypeBackground {
    layer1Fill: string
    layer1Outline: string
    layer2Fill: string
    layer2Outline: string
    layer3Fill: string
    layer3Outline: string
    highlightOutline: string
    highlightFill: string
  }

  export interface PaletteColorOptions extends MuiPaletteColorOptions {}
  export interface PaletteColor extends MuiPaletteColor {}

  export interface PaletteOptions extends MuiPaletteOptions {
    neutral: PaletteColorOptions;
    tertiary: PaletteColorOptions;
  }
}
