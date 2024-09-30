import type { FigmaTypography, FigmaTypographyToken } from '@/shared/api/figma-tokens'
import { ThemeFontFamily, type ThemeKey } from '@/shared/lib/basic-theme'
import { capitalizeFirstLetter, capitalizeSpecificWords } from '@/shared/lib/capitalize'
import type { NonTableTypographyVariantKey, TableTypographyVariantKey, TypographyVariantKey } from './config'

const wordsToCapitalize = ['bold', 'regular', 'medium', 'light', 'notional', 'label']

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
