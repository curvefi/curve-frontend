import { SurfacesAndText } from './1_surfaces_text'
import { createLightDesign, createDarkDesign, createChadDesign } from './2_theme'

export type PaletteVariants = {
  inverted?: boolean
}

export const DesignSystem = {
  light: ({ inverted }: PaletteVariants) =>
    createLightDesign(inverted ? SurfacesAndText.inverted.Light : SurfacesAndText.plain.Light),
  dark: ({ inverted }: PaletteVariants) =>
    createDarkDesign(inverted ? SurfacesAndText.inverted.Dark : SurfacesAndText.plain.Dark),
  chad: ({ inverted }: PaletteVariants) =>
    createChadDesign(inverted ? SurfacesAndText.inverted.Chad : SurfacesAndText.plain.Chad),
}

export type DesignSystem = ReturnType<(typeof DesignSystem)[keyof typeof DesignSystem]>
