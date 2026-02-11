import { createResolver, getSet, isObject } from './extractors.ts'
import {
  buildStyledTreeFromPathValues,
  collectSuffixes,
  getDeep,
  getStyledKey,
  getStyledPathSegments,
  hasAnyPath,
  setDeep,
  sortObjectDeep,
  toSurfacePrimitiveReference,
  toThemePrimitiveReference,
  withSizePrimitiveReferences,
  withThemeSurfaceReferences,
  buildTsAccessExpression,
  normalizeKeyForMatch,
} from './reference-renderer.ts'
import { isColorLikeValue, isLeafValue, normalizeDimension, normalizeFontWeight } from './sd-runtime.ts'
import { OPTIONAL_THEME_TOKEN_PATHS, REQUIRED_THEME_TOKEN_PATHS, markExpr } from './types.ts'
import type { JsonObject, ResolvedPathInfo, ThemeName, TokenLeafValue, TokenNode } from './types.ts'

const coerceLeaf = (expected: TokenLeafValue, resolvedRaw: unknown, tokenPath: string): TokenLeafValue => {
  if (typeof expected === 'string') {
    if (typeof resolvedRaw !== 'string') {
      throw new Error(`Token '${tokenPath}' must resolve to a string`)
    }
    return resolvedRaw
  }

  if (typeof expected === 'number') {
    if (typeof resolvedRaw === 'number') return resolvedRaw

    if (typeof resolvedRaw === 'string') {
      const direct = Number(resolvedRaw)
      if (Number.isFinite(direct)) return direct

      const pxMatch = resolvedRaw.match(/^\s*(-?\d+(?:\.\d+)?)px\s*$/i)
      if (pxMatch) return Number(pxMatch[1])
    }

    throw new Error(`Token '${tokenPath}' must resolve to a numeric value`)
  }

  if (typeof expected === 'boolean') {
    if (typeof resolvedRaw !== 'boolean') {
      throw new Error(`Token '${tokenPath}' must resolve to a boolean`)
    }
    return resolvedRaw
  }

  throw new Error(`Unsupported expected type at '${tokenPath}'`)
}

const normalizeTokenByType = (value: unknown, type: string | null): unknown => {
  const normalizedType = type?.toLowerCase() ?? ''

  if (normalizedType.includes('fontweight')) {
    return normalizeFontWeight(value)
  }

  if (
    normalizedType.includes('dimension') ||
    normalizedType.includes('fontsize') ||
    normalizedType.includes('lineheight') ||
    normalizedType.includes('spacing') ||
    normalizedType.includes('borderradius')
  ) {
    return normalizeDimension(value)
  }

  return value
}

const resolveLeafInfo = (resolver: ReturnType<typeof createResolver>, tokenPath: string): ResolvedPathInfo => {
  const info = resolver.resolvePathInfo(tokenPath)
  return {
    ...info,
    value: normalizeTokenByType(info.value, info.type),
  }
}

const resolveLeafValue = (resolver: ReturnType<typeof createResolver>, tokenPath: string): TokenLeafValue => {
  const resolved = resolveLeafInfo(resolver, tokenPath).value
  if (!isLeafValue(resolved)) {
    throw new Error(`Token '${tokenPath}' must resolve to a string, number, or boolean`)
  }
  return resolved
}

const coerceLeafForTemplate = (expected: unknown, resolvedRaw: unknown, tokenPath: string): TokenLeafValue => {
  if (isLeafValue(expected)) return coerceLeaf(expected, resolvedRaw, tokenPath)
  if (isLeafValue(resolvedRaw)) return resolvedRaw
  throw new Error(`Token '${tokenPath}' must resolve to a string, number, or boolean`)
}

const toValueMap = (set: Map<string, TokenNode>): Map<string, unknown> => {
  const out = new Map<string, unknown>()
  for (const [path, token] of set.entries()) {
    out.set(path, token.value)
  }
  return out
}

export const buildPrimitives = (
  template: JsonObject,
  primitiveBaseMap: Map<string, TokenNode>,
  resolver: ReturnType<typeof createResolver>,
): JsonObject => {
  const pluralMap: Record<string, string> = {
    Orange: 'Oranges',
    Oranges: 'Oranges',
    Violet: 'Violets',
    Violets: 'Violets',
    Yellow: 'Yellows',
    Yellows: 'Yellows',
  }

  const pathValues = new Map<string, TokenLeafValue>()
  for (const tokenPath of primitiveBaseMap.keys()) {
    pathValues.set(tokenPath, resolveLeafValue(resolver, tokenPath))
  }

  const result = buildStyledTreeFromPathValues(pathValues, template, (sourceSegments) => {
    if (sourceSegments.length === 0) return sourceSegments
    const [first, ...rest] = sourceSegments
    const mappedFirst = pluralMap[first] ?? first
    return [mappedFirst, ...rest]
  })

  // Keep known legacy primitive keys still consumed in UI-kit when absent in export.
  const legacyFallbacks: Record<string, TokenLeafValue> = {
    'Spacing.450': '1.25rem',
    'Sizing.450': '2.25rem',
  }
  for (const [optionalPath, fallbackValue] of Object.entries(legacyFallbacks)) {
    const styledSegments = getStyledPathSegments(template, optionalPath.split('.'))
    if (getDeep(result, styledSegments) !== undefined) continue
    setDeep(result, styledSegments, fallbackValue)
  }

  return sortObjectDeep(result) as JsonObject
}

const buildResponsiveGroup = (
  prefix: string,
  templateNode: unknown,
  sourceMaps: Array<Map<string, unknown>>,
  smResolver: ReturnType<typeof createResolver>,
  mdResolver: ReturnType<typeof createResolver>,
  lgResolver: ReturnType<typeof createResolver>,
) => {
  const out: JsonObject = {}
  const suffixes = collectSuffixes(sourceMaps, prefix)

  for (const suffix of suffixes) {
    const tokenPath = `${prefix}.${suffix}`
    const styledSegments = getStyledPathSegments(templateNode, suffix.split('.'))
    const expectedValue = getDeep(templateNode, styledSegments)
    const expectedMobile = isObject(expectedValue) ? expectedValue.mobile : undefined
    const expectedTablet = isObject(expectedValue) ? expectedValue.tablet : undefined
    const expectedDesktop = isObject(expectedValue) ? expectedValue.desktop : undefined

    setDeep(out, styledSegments, {
      mobile: coerceLeafForTemplate(expectedMobile, resolveLeafValue(smResolver, tokenPath), tokenPath),
      tablet: coerceLeafForTemplate(expectedTablet, resolveLeafValue(mdResolver, tokenPath), tokenPath),
      desktop: coerceLeafForTemplate(expectedDesktop, resolveLeafValue(lgResolver, tokenPath), tokenPath),
    })
  }

  return sortObjectDeep(out) as JsonObject
}

const buildScalarGroup = (
  prefix: string,
  templateNode: unknown,
  sourceMaps: Array<Map<string, unknown>>,
  resolver: ReturnType<typeof createResolver>,
) => {
  const pathValues = new Map<string, TokenLeafValue>()
  const suffixes = collectSuffixes(sourceMaps, prefix)

  for (const suffix of suffixes) {
    const tokenPath = `${prefix}.${suffix}`
    const styledSegments = getStyledPathSegments(templateNode, suffix.split('.'))
    const expectedValue = getDeep(templateNode, styledSegments)
    pathValues.set(suffix, coerceLeafForTemplate(expectedValue, resolveLeafValue(resolver, tokenPath), tokenPath))
  }

  return buildStyledTreeFromPathValues(pathValues, templateNode)
}

export const buildSizesAndSpaces = (
  template: JsonObject,
  setMaps: Map<string, Map<string, TokenNode>>,
  primitives: JsonObject,
): JsonObject => {
  const base = getSet(setMaps, '00_Primitives/Base')
  const sm = getSet(setMaps, '01_Mapped_Sizes&Spaces/sm')
  const md = getSet(setMaps, '01_Mapped_Sizes&Spaces/md')
  const lg = getSet(setMaps, '01_Mapped_Sizes&Spaces/lg')

  const smResolver = createResolver(new Map([...base, ...sm]))
  const mdResolver = createResolver(new Map([...base, ...md]))
  const lgResolver = createResolver(new Map([...base, ...lg]))

  const mappedSources = [toValueMap(sm), toValueMap(md), toValueMap(lg)]
  const out = JSON.parse(JSON.stringify(template)) as JsonObject

  out.Spacing = buildResponsiveGroup('Spacing', out.Spacing, mappedSources, smResolver, mdResolver, lgResolver)
  out.Sizing = buildResponsiveGroup('Sizing', out.Sizing, mappedSources, smResolver, mdResolver, lgResolver)
  out.IconSize = buildResponsiveGroup('IconSize', out.IconSize, mappedSources, smResolver, mdResolver, lgResolver)
  out.FontSize = buildResponsiveGroup(
    'Typography.FontSize',
    out.FontSize,
    mappedSources,
    smResolver,
    mdResolver,
    lgResolver,
  )
  out.LineHeight = buildResponsiveGroup(
    'Typography.LineHeight',
    out.LineHeight,
    mappedSources,
    smResolver,
    mdResolver,
    lgResolver,
  )

  const fontWeightValues = new Map<string, TokenLeafValue>()
  for (const suffix of collectSuffixes(mappedSources, 'Typography.FontWeight')) {
    const tokenPath = `Typography.FontWeight.${suffix}`
    fontWeightValues.set(suffix, normalizeFontWeight(resolveLeafValue(mdResolver, tokenPath)))
  }
  out.FontWeight = buildStyledTreeFromPathValues(fontWeightValues, out.FontWeight)

  const buttonHeightToSize: Record<string, string> = {
    XXS: 'xxs',
    XS: 'xs',
    S: 'sm',
    M: 'md',
    L: 'lg',
  }
  const buttonSizeValues = new Map<string, TokenLeafValue>()
  for (const suffix of collectSuffixes(mappedSources, 'ButtonHeight')) {
    const targetSuffix = buttonHeightToSize[suffix] ?? suffix
    buttonSizeValues.set(targetSuffix, resolveLeafValue(mdResolver, `ButtonHeight.${suffix}`))
  }
  out.ButtonSize = buildStyledTreeFromPathValues(buttonSizeValues, out.ButtonSize)

  if (isObject(out.Width)) {
    const width = JSON.parse(JSON.stringify(out.Width)) as JsonObject
    width.modal = buildScalarGroup('ModalWidth', width.modal, mappedSources, mdResolver)
    out.Width = width
  }

  const gridTemplate = isObject(out.Grid) ? (out.Grid as JsonObject) : {}
  const grid = JSON.parse(JSON.stringify(gridTemplate)) as JsonObject
  for (const existingKey of Object.keys(gridTemplate)) {
    const normalized = normalizeKeyForMatch(existingKey)
    if (normalized === normalizeKeyForMatch('Column Spacing') || normalized === normalizeKeyForMatch('Row Spacing')) {
      delete grid[existingKey]
    }
  }

  for (const sourceGridKey of ['Column Spacing', 'Row Spacing']) {
    const tokenPath = `Grid.${sourceGridKey}`
    if (!hasAnyPath(mappedSources, tokenPath)) continue
    const styledGridKey = getStyledKey(gridTemplate, sourceGridKey)
    grid[styledGridKey] = {
      mobile: resolveLeafValue(smResolver, tokenPath),
      tablet: resolveLeafValue(mdResolver, tokenPath),
      desktop: resolveLeafValue(lgResolver, tokenPath),
    }
  }

  out.Grid = sortObjectDeep(grid) as JsonObject

  return withSizePrimitiveReferences(out, primitives)
}

export const buildSurfacesPlain = (
  template: Record<'Light' | 'Dark' | 'Chad', unknown>,
  setMaps: Map<string, Map<string, TokenNode>>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
): Record<'Light' | 'Dark' | 'Chad', unknown> => {
  const defaultSurfacesSet = getSet(setMaps, '01_Surfaces&Text/Default')

  const buildOne = (themeLabel: 'Light' | 'Dark' | 'Chad', themeMap: Map<string, TokenNode>, templateNode: unknown) => {
    const resolver = createResolver(themeMap)
    const themePrefix = `${themeLabel}.`
    const pathValues = new Map<string, TokenLeafValue>()

    for (const sourcePath of [...defaultSurfacesSet.keys()].sort((a, b) => a.localeCompare(b))) {
      if (!sourcePath.startsWith(themePrefix)) continue
      const localPath = sourcePath.slice(themePrefix.length)
      if (!localPath) continue
      const resolvedInfo = resolveLeafInfo(resolver, sourcePath)
      if (!isLeafValue(resolvedInfo.value)) {
        throw new Error(`Token '${sourcePath}' must resolve to a string, number, or boolean`)
      }
      pathValues.set(localPath, toSurfacePrimitiveReference(resolvedInfo.value, resolvedInfo.terminalPath))
    }

    return buildStyledTreeFromPathValues(pathValues, templateNode, (segments) => {
      if (
        segments.length >= 4 &&
        segments[0] === 'Tables' &&
        segments[1] === 'Header' &&
        segments[2] === 'Label & Icon'
      ) {
        return ['Tables', 'Header', 'Label', ...segments.slice(3)]
      }
      return segments
    })
  }

  return {
    Light: buildOne('Light', resolvedThemes.light, template.Light),
    Dark: buildOne('Dark', resolvedThemes.dark, template.Dark),
    Chad: buildOne('Chad', resolvedThemes.chad, template.Chad),
  }
}

const THEME_PREFIX_BY_NAME: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  chad: 'Chad',
}

const normalizeThemeTemplateNode = (templateNode: unknown): JsonObject => {
  if (!isObject(templateNode)) return {}

  const out: JsonObject = {}
  for (const [key, value] of Object.entries(templateNode)) {
    if (isObject(value)) {
      out[key] = normalizeThemeTemplateNode(value)
      continue
    }

    if (isLeafValue(value) && key.includes('.')) {
      setDeep(out, key.split('.'), value)
      continue
    }

    out[key] = value
  }

  return out
}

const toLocalThemePath = (theme: ThemeName, sourcePath: string): string | null => {
  const segments = sourcePath.split('.').filter(Boolean)
  if (segments.length === 0) return null

  const currentPrefix = normalizeKeyForMatch(THEME_PREFIX_BY_NAME[theme])
  const first = normalizeKeyForMatch(segments[0])
  const allPrefixes = new Set(Object.values(THEME_PREFIX_BY_NAME).map((prefix) => normalizeKeyForMatch(prefix)))

  if (first === currentPrefix) {
    return segments.slice(1).join('.')
  }

  if (allPrefixes.has(first)) {
    return null
  }

  return sourcePath
}

const removeColorLeaves = (value: unknown): unknown => {
  if (!isObject(value)) return value

  const out: JsonObject = {}
  for (const [key, child] of Object.entries(value)) {
    if (isObject(child)) {
      const cleaned = removeColorLeaves(child)
      if (!isObject(cleaned) || Object.keys(cleaned).length > 0) {
        out[key] = cleaned
      }
      continue
    }

    if (typeof child === 'string' && isColorLikeValue(child)) {
      continue
    }

    out[key] = child
  }

  return out
}

const mergeDeepObjects = (base: JsonObject, updates: JsonObject): JsonObject => {
  const out = JSON.parse(JSON.stringify(base)) as JsonObject

  for (const [key, value] of Object.entries(updates)) {
    if (isObject(value) && isObject(out[key])) {
      out[key] = mergeDeepObjects(out[key] as JsonObject, value)
      continue
    }

    out[key] = JSON.parse(JSON.stringify(value))
  }

  return out
}

export const buildThemeTokens = (
  template: Record<ThemeName, unknown>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
  colorOnly: boolean,
): Record<ThemeName, JsonObject> => {
  const out = {
    light: {},
    dark: {},
    chad: {},
  } as Record<ThemeName, JsonObject>

  for (const theme of ['light', 'dark', 'chad'] as const) {
    const resolver = createResolver(resolvedThemes[theme])
    const missingRequired: string[] = []
    const themePrefix = THEME_PREFIX_BY_NAME[theme]
    const pathValues = new Map<string, TokenLeafValue>()
    const templateNode = normalizeThemeTemplateNode(template[theme])

    for (const key of REQUIRED_THEME_TOKEN_PATHS) {
      let resolvedInfo: ResolvedPathInfo | null = null
      let resolvedToken = false

      for (const candidate of [key, `${themePrefix}.${key}`]) {
        try {
          resolvedInfo = resolveLeafInfo(resolver, candidate)
          resolvedToken = true
          break
        } catch {
          // try next candidate
        }
      }

      if (!resolvedToken) {
        if (!OPTIONAL_THEME_TOKEN_PATHS.has(key)) {
          missingRequired.push(key)
        }
        continue
      }

      if (resolvedInfo && isLeafValue(resolvedInfo.value)) {
        if (colorOnly && (typeof resolvedInfo.value !== 'string' || !isColorLikeValue(resolvedInfo.value))) continue
        pathValues.set(key, toThemePrimitiveReference(resolvedInfo.value, resolvedInfo.terminalPath))
      }
    }

    for (const sourcePath of [...resolvedThemes[theme].keys()].sort((a, b) => a.localeCompare(b))) {
      const localPath = toLocalThemePath(theme, sourcePath)
      if (!localPath) continue

      const resolvedInfo = resolveLeafInfo(resolver, sourcePath)
      if (!isLeafValue(resolvedInfo.value)) continue
      if (colorOnly && (typeof resolvedInfo.value !== 'string' || !isColorLikeValue(resolvedInfo.value))) continue
      pathValues.set(localPath, toThemePrimitiveReference(resolvedInfo.value, resolvedInfo.terminalPath))
    }

    if (missingRequired.length > 0) {
      throw new Error(`Missing required runtime token(s) for theme '${theme}': ${missingRequired.join(', ')}`)
    }

    out[theme] = buildStyledTreeFromPathValues(pathValues, templateNode)
  }

  return out
}

export const mergeColorOnlyThemeTokens = (
  template: Record<ThemeName, unknown>,
  colorUpdates: Record<ThemeName, JsonObject>,
): Record<ThemeName, JsonObject> => {
  const out = {
    light: {},
    dark: {},
    chad: {},
  } as Record<ThemeName, JsonObject>

  for (const theme of ['light', 'dark', 'chad'] as const) {
    const templateNode = normalizeThemeTemplateNode(template[theme])
    const nonColorTemplate = removeColorLeaves(templateNode)
    const merged = mergeDeepObjects(isObject(nonColorTemplate) ? nonColorTemplate : {}, colorUpdates[theme])
    out[theme] = sortObjectDeep(merged) as JsonObject
  }

  return out
}

const tryResolveOptional = (
  resolver: ReturnType<typeof createResolver>,
  tokenPath: string,
  fallback: unknown,
  expected: TokenLeafValue,
): TokenLeafValue => {
  try {
    return coerceLeaf(expected, resolveLeafValue(resolver, tokenPath), tokenPath)
  } catch {
    return fallback as TokenLeafValue
  }
}

export const buildThemeConstants = (
  template: Record<ThemeName, unknown>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
  colorOnly: boolean,
): Record<ThemeName, unknown> => {
  const out = JSON.parse(JSON.stringify(template)) as Record<ThemeName, JsonObject>

  for (const theme of ['light', 'dark', 'chad'] as const) {
    const resolver = createResolver(resolvedThemes[theme])
    const node = out[theme] as JsonObject

    node.appBackground = coerceLeaf(
      node.appBackground as TokenLeafValue,
      resolveLeafValue(resolver, 'Layer.App.Background'),
      'Layer.App.Background',
    )

    if (colorOnly) continue

    const slider = node.slider as JsonObject
    if (!isObject(slider)) continue

    const defaults = slider.default as JsonObject
    const hover = slider.hover as JsonObject

    defaults.SliderThumbImage = tryResolveOptional(
      resolver,
      'Sliders.default.SliderThumbImage',
      defaults.SliderThumbImage,
      defaults.SliderThumbImage as TokenLeafValue,
    )
    defaults.SliderThumbImageVertical = tryResolveOptional(
      resolver,
      'Sliders.default.SliderThumbImageVertical',
      defaults.SliderThumbImageVertical,
      defaults.SliderThumbImageVertical as TokenLeafValue,
    )
    hover.SliderThumbImage = tryResolveOptional(
      resolver,
      'Sliders.hover.SliderThumbImage',
      hover.SliderThumbImage,
      hover.SliderThumbImage as TokenLeafValue,
    )
    hover.SliderThumbImageVertical = tryResolveOptional(
      resolver,
      'Sliders.hover.SliderThumbImageVertical',
      hover.SliderThumbImageVertical,
      hover.SliderThumbImageVertical as TokenLeafValue,
    )
  }

  return out
}

const normalizeTypographyKey = (path: string): string => {
  const explicit: Record<string, string> = {
    'Heading.XXL': 'headingXxl',
    'Heading.MBold': 'headingMBold',
    'Heading.MLight': 'headingMLight',
    'Heading.SBold': 'headingSBold',
    'Heading.XsBold': 'headingXsBold',
    'Heading.XsMedium': 'headingXsMedium',
    'Body.MRegular': 'bodyMRegular',
    'Body.MBold': 'bodyMBold',
    'Body.SRegular': 'bodySRegular',
    'Body.SBold': 'bodySBold',
    'Body.XsRegular': 'bodyXsRegular',
    'Body.XsBold': 'bodyXsBold',
    'ButtonLabel.XS': 'buttonXs',
    'ButtonLabel.S': 'buttonS',
    'ButtonLabel.M': 'buttonM',
    'Table.Header.M': 'tableHeaderM',
    'Table.Header.S': 'tableHeaderS',
    'Table.Cell.L': 'tableCellL',
    'Table.Cell.MRegular': 'tableCellMRegular',
    'Table.Cell.MBold': 'tableCellMBold',
    'Table.Cell.SRegular': 'tableCellSRegular',
    'Table.Cell.SBold': 'tableCellSBold',
    'Highlighted.XSNotional': 'highlightXsNotional',
    'Highlighted.XS': 'highlightXs',
    'Highlighted.S': 'highlightS',
    'Highlighted.M': 'highlightM',
    'Highlighted.L': 'highlightL',
    'Highlighted.XL': 'highlightXl',
    'Highlighted.XXL': 'highlightXxl',
  }

  if (explicit[path]) return explicit[path]

  const cleaned = path.replace(/[^a-zA-Z0-9]+/g, ' ')
  const words = cleaned
    .split(' ')
    .map((w) => w.trim())
    .filter(Boolean)

  if (words.length === 0) return path

  const [head, ...tail] = words
  return `${head.toLowerCase()}${tail.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`
}

const resolveTypographyField = (value: unknown, resolver: ReturnType<typeof createResolver>): ResolvedPathInfo => {
  if (typeof value === 'string') {
    const match = value.match(/^\{(.+)}$/)
    if (match) {
      const resolved = resolver.resolvePathInfo(match[1])
      return {
        ...resolved,
        value: normalizeTokenByType(resolved.value, resolved.type),
      }
    }
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
      // noop
    }
  }
  return out
}

const expressionForSizingPath = (terminalPath: string): string | null => {
  const segments = terminalPath.split('.').filter(Boolean)
  if (segments.length === 0) return null

  if (segments[0] === 'Sizing' && segments[1]) {
    return buildTsAccessExpression('Sizing', [segments[1]])
  }

  return null
}

const preferFontSizeKey = (terminalPath: string, fontSizeTemplate: unknown): string | null => {
  const segments = terminalPath.split('.').filter(Boolean)
  if (segments.length >= 3 && segments[0] === 'Typography' && segments[1] === 'FontSize') {
    const sourceKey = segments[2]
    const styled = getStyledKey(fontSizeTemplate, sourceKey)
    return styled
  }
  return null
}

const preferLineHeightKey = (terminalPath: string, lineHeightTemplate: unknown): string | null => {
  const segments = terminalPath.split('.').filter(Boolean)
  if (segments.length >= 3 && segments[0] === 'Typography' && segments[1] === 'LineHeight') {
    const sourceKey = segments[2]
    const styled = getStyledKey(lineHeightTemplate, sourceKey)
    return styled
  }
  return null
}

export const buildTypographyVariants = (
  template: Record<string, unknown>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
  sizesAndSpaces: JsonObject,
): Record<string, unknown> => {
  const light = resolvedThemes.light
  const resolver = createResolver(light)
  const weightMap = weightKeyByValue(sizesAndSpaces.FontWeight)

  const variants: Record<string, unknown> = JSON.parse(JSON.stringify(template))

  const typographyTokens = [...light.entries()]
    .filter(([, token]) => token.type?.toLowerCase() === 'typography')
    .sort(([a], [b]) => a.localeCompare(b))

  for (const [path, token] of typographyTokens) {
    if (!isObject(token.value)) continue

    const key = normalizeTypographyKey(path)
    const hasTemplateMatch = Object.keys(template).some(
      (existingKey) => normalizeKeyForMatch(existingKey) === normalizeKeyForMatch(key),
    )
    if (!hasTemplateMatch) continue

    const fontWeightField = resolveTypographyField(token.value.fontWeight, resolver)
    const fontSizeField = resolveTypographyField(token.value.fontSize, resolver)
    const lineHeightField = resolveTypographyField(token.value.lineHeight, resolver)
    const letterSpacingField = resolveTypographyField(token.value.letterSpacing, resolver)
    const textCaseField = resolveTypographyField(token.value.textCase, resolver)

    const fontFamilyFromRef =
      typeof token.value.fontFamily === 'string'
        ? token.value.fontFamily.match(/^\{Text\.FontFamily\.([^}]+)}$/)?.[1]
        : undefined

    const fontFamily = fontFamilyFromRef ?? 'Body'

    const resolvedWeight = normalizeFontWeight(fontWeightField.value)
    const fontWeight = weightMap.get(resolvedWeight)

    const preferredFontSizeKey = preferFontSizeKey(fontSizeField.terminalPath, sizesAndSpaces.FontSize)
    const preferredLineHeightKey = preferLineHeightKey(lineHeightField.terminalPath, sizesAndSpaces.LineHeight)

    const fontSizeExpr = expressionForSizingPath(fontSizeField.terminalPath)
    const lineHeightExpr = expressionForSizingPath(lineHeightField.terminalPath)

    const next: JsonObject = {
      fontFamily,
    }

    if (fontWeight) next.fontWeight = fontWeight

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

    const styledKey = getStyledKey(template, key)
    variants[styledKey] = next
  }

  // Preserve deterministic key order.
  return Object.fromEntries(Object.entries(variants).sort(([a], [b]) => a.localeCompare(b)))
}

export const buildThemeTokensWithReferences = (
  template: Record<ThemeName, unknown>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
  colorOnly: boolean,
  surfacesPlain: Record<'Light' | 'Dark' | 'Chad', unknown>,
): Record<ThemeName, JsonObject> => {
  const computedThemeTokens = buildThemeTokens(template, resolvedThemes, colorOnly)
  const mergedThemeTokens = colorOnly ? mergeColorOnlyThemeTokens(template, computedThemeTokens) : computedThemeTokens
  return withThemeSurfaceReferences(mergedThemeTokens, surfacesPlain)
}
