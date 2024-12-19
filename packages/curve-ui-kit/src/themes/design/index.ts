import { SurfacesAndText } from './1_surfaces_text'
import { createLightDesign, createDarkDesign, createChadDesign } from './2_theme'

export type DesignOptions = {
  inverted?: boolean
}

export const DesignSystem = {
  light: ({ inverted }: DesignOptions) => createLightDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Light),
  dark: ({ inverted }: DesignOptions) => createDarkDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Dark),
  chad: ({ inverted }: DesignOptions) => createChadDesign(SurfacesAndText[inverted ? 'inverted' : 'plain'].Chad),
}

export type DesignSystem = ReturnType<(typeof DesignSystem)[keyof typeof DesignSystem]>
