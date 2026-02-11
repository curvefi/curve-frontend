import { resolveLeafInfo } from '../core.ts'
import type { BuildContext } from '../core.ts'
import { isObject } from '../extractors.ts'
import { TYPOGRAPHY_KEY_OVERRIDES } from '../mappings.ts'
import { buildTsAccessExpression, getStyledKey } from '../reference-renderer.ts'
import { normalizeFontWeight } from '../sd-runtime.ts'
import { markExpr } from '../types.ts'
import type { JsonObject, ThemeName, TokenNode } from '../types.ts'

const normalizeTypographyKey = (path: string): string => {
  if (TYPOGRAPHY_KEY_OVERRIDES[path]) return TYPOGRAPHY_KEY_OVERRIDES[path]

  const words = path
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .map((w) => w.trim())
    .filter(Boolean)

  if (words.length === 0) return path
  const [head, ...tail] = words
  return `${head.toLowerCase()}${tail.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`
}

const resolveTypographyField = (value: unknown, resolver: BuildContext['themes'][ThemeName]['resolver']) => {
  if (typeof value === 'string') {
    const match = value.match(/^\{(.+)}$/)
    if (match) return resolveLeafInfo(resolver, match[1])
  }

  return {
    value,
    type: null,
    terminalPath: '',
  }
}

const weightKeyByValue = (fontWeights: unknown): Map<number, string> => {
  const out = new Map<number, string>()
  if (!isObject(fontWeights)) return out

  for (const [key, raw] of Object.entries(fontWeights)) {
    try {
      out.set(normalizeFontWeight(raw), key)
    } catch {
      // ignore unsupported values
    }
  }

  return out
}

const expressionForSizingPath = (terminalPath: string): string | null => {
  const segments = terminalPath.split('.').filter(Boolean)
  return segments.length >= 2 && segments[0] === 'Sizing' ? buildTsAccessExpression('Sizing', [segments[1]]) : null
}

const preferSizingKey = (terminalPath: string, group: 'FontSize' | 'LineHeight', template: unknown): string | null => {
  const segments = terminalPath.split('.').filter(Boolean)
  if (segments.length >= 3 && segments[0] === 'Typography' && segments[1] === group) {
    return getStyledKey(template, segments[2])
  }
  return null
}

export const buildTypographyVariants = (
  template: Record<string, unknown>,
  context: BuildContext,
  sizesAndSpaces: JsonObject,
): Record<string, unknown> => {
  const { resolver, sortedPaths, map } = context.themes.light
  const weightMap = weightKeyByValue(sizesAndSpaces.FontWeight)

  const typographyPaths = sortedPaths.filter((path) => map.get(path)?.type?.toLowerCase() === 'typography')
  const variants: Record<string, unknown> = {}

  for (const path of typographyPaths) {
    const token = map.get(path) as TokenNode | undefined
    if (!token || !isObject(token.value)) continue

    const key = normalizeTypographyKey(path)
    const fontWeightField = resolveTypographyField(token.value.fontWeight, resolver)
    const fontSizeField = resolveTypographyField(token.value.fontSize, resolver)
    const lineHeightField = resolveTypographyField(token.value.lineHeight, resolver)
    const letterSpacingField = resolveTypographyField(token.value.letterSpacing, resolver)
    const textCaseField = resolveTypographyField(token.value.textCase, resolver)

    const fontFamilyFromRef =
      typeof token.value.fontFamily === 'string'
        ? token.value.fontFamily.match(/^\{Text\.FontFamily\.([^}]+)}$/)?.[1]
        : undefined

    const next: JsonObject = {
      fontFamily: fontFamilyFromRef ?? 'Body',
    }

    const resolvedWeight = normalizeFontWeight(fontWeightField.value)
    const fontWeight = weightMap.get(resolvedWeight)
    if (fontWeight) next.fontWeight = fontWeight

    const preferredFontSizeKey = preferSizingKey(fontSizeField.terminalPath, 'FontSize', sizesAndSpaces.FontSize)
    const preferredLineHeightKey = preferSizingKey(
      lineHeightField.terminalPath,
      'LineHeight',
      sizesAndSpaces.LineHeight,
    )
    const fontSizeExpr = expressionForSizingPath(fontSizeField.terminalPath)
    const lineHeightExpr = expressionForSizingPath(lineHeightField.terminalPath)

    if (preferredFontSizeKey) {
      next.fontSize = preferredFontSizeKey
    } else if (fontSizeExpr) {
      next.fontSize = markExpr(fontSizeExpr)
    } else if (typeof fontSizeField.value === 'string') {
      next.fontSize = fontSizeField.value
    }

    if (preferredLineHeightKey) {
      next.lineHeight = preferredLineHeightKey
    } else if (lineHeightExpr) {
      next.lineHeight = markExpr(lineHeightExpr)
    } else if (typeof lineHeightField.value === 'string') {
      next.lineHeight = lineHeightField.value
    }

    if (
      typeof letterSpacingField.value === 'string' &&
      letterSpacingField.value !== '0%' &&
      letterSpacingField.value !== 'none'
    ) {
      next.letterSpacing = letterSpacingField.value
    }

    if (typeof textCaseField.value === 'string' && ['uppercase', 'capitalize'].includes(textCaseField.value)) {
      next.textCase = textCaseField.value
    }

    variants[getStyledKey(template, key)] = next
  }

  return Object.fromEntries(Object.entries(variants).sort(([a], [b]) => a.localeCompare(b)))
}
