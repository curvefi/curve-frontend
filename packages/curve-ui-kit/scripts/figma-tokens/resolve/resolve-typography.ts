import { capitalizeFirstLetter, capitalizeSpecificWords, removeDashes } from './capitalize'
import { FigmaTypographyToken } from '../tokens'
import { FigmaTypography } from './resolved-categories'

export type ResolvedTypography = Record<string, React.CSSProperties>

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
const transformTypographyToken = ({
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
}: FigmaTypographyToken): React.CSSProperties & { description?: string } => ({
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
})

const cleanKey = (category: string, style: string) =>
  capitalizeSpecificWords(`${category}${(capitalizeFirstLetter(removeDashes(style)))}`, wordsToCapitalize)

/**
 * Resolves typography variants from Figma typography tokens, excluding table-specific styles.
 * This function creates a mapping of typography variant keys to their corresponding CSS properties.
 *
 * @param figmaTypography - The Figma typography object containing all typography styles
 * @returns An object mapping non-table typography variant keys to their CSS properties
 */
export const resolveTypographyVariants = <T extends Omit<FigmaTypography, 'table'>>(
  figmaTypography: T,
) => Object.fromEntries(
  Object.entries(figmaTypography)
    .flatMap(([category, styles]) =>
      Object.entries(styles as Record<string, FigmaTypographyToken>).map(([style, token]) => [
        cleanKey(category, style),
        transformTypographyToken(token)
      ])
    )
)
