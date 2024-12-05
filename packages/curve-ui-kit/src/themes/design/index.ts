import { SurfacesAndText } from './1_surfaces_text'
import { createLightDesign, createDarkDesign, createChadDesign } from './2_theme'

export type PaletteVariants = {
  inverted?: boolean
}

export const DesignSystem = {
  light: ({ inverted }: PaletteVariants) => createLightDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Light),
  dark: ({ inverted }: PaletteVariants) => createDarkDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Dark),
  chad: ({ inverted }: PaletteVariants) => createChadDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Chad),
}

export type DesignSystem = ReturnType<(typeof DesignSystem)[keyof typeof DesignSystem]>
