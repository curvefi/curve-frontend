import {
  resolveTableTypographyVariants,
  resolveTypographyVariants,
  type ResolvedTypography,
} from '../../../ui/Typography'
import { curveFigmaDesignTokens, type CurveFigmaDesignTokens, type ScreenType } from '../tokens'
import { resolveFigmaTokens, type ResolvedValue } from './resolver'

export const GridCategory = '00_grid' as const
export const PrimitivesCategory = '00_primitives' as const
export const EffectCategory = '00_effect' as const
export const SurfacesAndTextCategory = '01_surfaces&text' as const
export const MappedSizesAndSpacesCategory = '01_mapped_sizes&spaces' as const
export const TypographyCategory = 'typography' as const
export const ThemeCategory = '02_theme' as const
export const FontCategory = '02_font' as const

export type ResolvedFigmaTokens = ResolvedValue<CurveFigmaDesignTokens>

export type FigmaTypography = ResolvedFigmaTokens[typeof TypographyCategory]
export type FigmaPrimitives = ResolvedFigmaTokens[typeof PrimitivesCategory]
export type FigmaEffects = ResolvedFigmaTokens[typeof EffectCategory]
export type FigmaGrid = ResolvedFigmaTokens[typeof GridCategory]
export type FigmaSurfacesAndText = ResolvedFigmaTokens[typeof SurfacesAndTextCategory]
export type FigmaMappedSizesAndSpaces = ResolvedFigmaTokens[typeof MappedSizesAndSpacesCategory]
export type FigmaTheme = ResolvedFigmaTokens[typeof ThemeCategory]
export type FigmaThemes = Record<ScreenType, FigmaTheme>

export type FigmaTokens = {
  typography: ResolvedTypography
  primitives: FigmaPrimitives
  effects: FigmaEffects
  grid: FigmaGrid
  surfacesAndText: FigmaSurfacesAndText
  mappedSizesAndSpaces: FigmaMappedSizesAndSpaces
  themes: FigmaThemes
}

const figmaTokensDesktop: ResolvedFigmaTokens = resolveFigmaTokens(curveFigmaDesignTokens)
const figmaTokensMobile: ResolvedFigmaTokens = resolveFigmaTokens(curveFigmaDesignTokens, 'mobile')

export const figmaTokens: FigmaTokens = {
  typography: {
    ...resolveTypographyVariants(figmaTokensDesktop[TypographyCategory]),
    ...resolveTableTypographyVariants(figmaTokensDesktop[TypographyCategory]),
  },
  primitives: figmaTokensDesktop[PrimitivesCategory],
  effects: figmaTokensDesktop[EffectCategory],
  grid: figmaTokensDesktop[GridCategory],
  surfacesAndText: figmaTokensDesktop[SurfacesAndTextCategory],
  mappedSizesAndSpaces: figmaTokensDesktop[MappedSizesAndSpacesCategory],
  themes: {
    desktop: figmaTokensDesktop[ThemeCategory],
    mobile: figmaTokensMobile[ThemeCategory],
  },
} as const
