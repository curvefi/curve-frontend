import type { FigmaTypography, FigmaTypographyToken } from '@/shared/api/figma-tokens'
import { ThemeFontFamily, type ThemeKey } from '@/shared/lib/basic-theme'
import { capitalizeFirstLetter, capitalizeSpecificWords } from '@/shared/lib/capitalize'
import type { NonTableTypographyVariantKey, TableTypographyVariantKey, TypographyVariantKey } from './config'

/**
 * List of words that should be capitalized in typography variant keys.
 */
const wordsToCapitalize = ['bold', 'regular', 'medium', 'light', 'notional', 'label']

/**
 * Transforms a Figma typography token into a React CSS properties object.
 * This function maps Figma-specific typography properties to their CSS equivalents.
 *
 * @param token - The Figma typography token to transform
 * @returns A React CSS properties object with an optional description
 */
function transformTypographyToken(token: FigmaTypographyToken): React.CSSProperties & { description?: string } {
  const {
    fontSize,
    fontStretch,
    fontStyle,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    paragraphIndent,
    paragraphSpacing,
    textCase,
    textDecoration,
    description,
  } = token

  return {
    description,
    fontSize: `${fontSize}px`,
    fontWeight,
    fontStyle,
    fontStretch,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: `${lineHeight}px`,
    textDecoration,
    fontFamily,
    textIndent: paragraphIndent,
    textTransform: textCase,
    // We're not using paragraphSpacing here, as it's not a valid CSS property.
  }
}

/**
 * Resolves typography variants from Figma typography tokens, excluding table-specific styles.
 * This function creates a mapping of typography variant keys to their corresponding CSS properties.
 *
 * @param figmaTypography - The Figma typography object containing all typography styles
 * @returns An object mapping non-table typography variant keys to their CSS properties
 */
export function resolveTypographyVariants<T extends Omit<FigmaTypography, 'table'>>(
  figmaTypography: T,
): Record<NonTableTypographyVariantKey, React.CSSProperties & { description?: string }> {
  const result: Partial<Record<TypographyVariantKey, React.CSSProperties>> = {}

  for (const [category, styles] of Object.entries(figmaTypography)) {
    if (category === 'table') {
      continue
    }
    for (const [style, token] of Object.entries(styles) as [string, FigmaTypographyToken][]) {
      const key = capitalizeSpecificWords(
        `${category}${capitalizeFirstLetter(style)}`,
        wordsToCapitalize,
      ) as NonTableTypographyVariantKey
      result[key] = transformTypographyToken(token)
    }
  }

  return result as Record<NonTableTypographyVariantKey, React.CSSProperties & { description?: string }>
}

/**
 * Resolves table-specific typography variants from Figma typography tokens.
 * This function creates a mapping of table typography variant keys to their corresponding CSS properties.
 *
 * @param figmaTypography - The Figma typography object containing table-specific styles
 * @returns An object mapping table typography variant keys to their CSS properties
 */
export function resolveTableTypographyVariants<T extends Pick<FigmaTypography, 'table'>>(
  figmaTypography: T,
): Record<TableTypographyVariantKey, React.CSSProperties & { description?: string }> {
  const result: Partial<Record<TypographyVariantKey, React.CSSProperties>> = {}

  for (const [tableType, styles] of Object.entries(figmaTypography.table)) {
    for (const [style, token] of Object.entries(styles) as [string, FigmaTypographyToken][]) {
      const key = capitalizeSpecificWords(
        `table${capitalizeFirstLetter(tableType)}${capitalizeFirstLetter(style)}`,
        wordsToCapitalize,
      ) as TableTypographyVariantKey

      result[key] = transformTypographyToken(token)
    }
  }

  return result as Record<TableTypographyVariantKey, React.CSSProperties & { description?: string }>
}
