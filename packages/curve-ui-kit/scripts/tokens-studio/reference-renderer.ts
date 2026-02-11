import { cloneJson, isLeafValue } from './sd-runtime.ts'
import { markExpr, SURFACE_PRIMITIVE_ROOTS, THEME_PRIMITIVE_ROOTS } from './types.ts'
import { getExprFromMarker, isExprMarker } from './types.ts'
import type { JsonObject, ThemeName, TokenLeafValue, WarningCollector } from './types.ts'

export const normalizeKeyForMatch = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

export const getStyledKey = (templateNode: unknown, sourceKey: string) => {
  if (!templateNode || typeof templateNode !== 'object' || Array.isArray(templateNode)) return sourceKey
  const sourceNormalized = normalizeKeyForMatch(sourceKey)
  const matched = Object.keys(templateNode as JsonObject).find((key) => normalizeKeyForMatch(key) === sourceNormalized)
  return matched ?? sourceKey
}

export const getStyledPathSegments = (templateNode: unknown, sourceSegments: string[]) => {
  const styled: string[] = []
  let currentTemplate: unknown = templateNode

  for (const sourceSegment of sourceSegments) {
    const styledSegment = getStyledKey(currentTemplate, sourceSegment)
    styled.push(styledSegment)
    currentTemplate =
      currentTemplate && typeof currentTemplate === 'object' && !Array.isArray(currentTemplate)
        ? (currentTemplate as JsonObject)[styledSegment]
        : undefined
  }

  return styled
}

export const setDeep = (target: JsonObject, pathSegments: string[], value: unknown) => {
  if (pathSegments.length === 0) return

  let node: JsonObject = target
  for (let i = 0; i < pathSegments.length - 1; i += 1) {
    const segment = pathSegments[i]
    const current = node[segment]
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      node[segment] = {}
    }
    node = node[segment] as JsonObject
  }

  node[pathSegments[pathSegments.length - 1]] = value
}

export const getDeep = (source: unknown, pathSegments: string[]) => {
  let node = source
  for (const segment of pathSegments) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return undefined
    node = (node as JsonObject)[segment]
  }
  return node
}

export const sortObjectDeep = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value
  const sortedEntries = Object.entries(value as JsonObject)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, child]) => [key, sortObjectDeep(child)])
  return Object.fromEntries(sortedEntries)
}

export const collectLeafPaths = (
  node: unknown,
  path: string[] = [],
): Array<{ path: string[]; value: TokenLeafValue }> => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    return isLeafValue(node) ? [{ path, value: node }] : []
  }

  const leaves: Array<{ path: string[]; value: TokenLeafValue }> = []
  for (const [key, child] of Object.entries(node as JsonObject)) {
    leaves.push(...collectLeafPaths(child, [...path, key]))
  }
  return leaves
}

export const collectSuffixes = (maps: Array<Map<string, unknown>>, prefix: string) => {
  const suffixes = new Set<string>()
  for (const map of maps) {
    for (const key of map.keys()) {
      if (!key.startsWith(`${prefix}.`)) continue
      suffixes.add(key.slice(prefix.length + 1))
    }
  }
  return [...suffixes].sort((a, b) => a.localeCompare(b))
}

export const hasAnyPath = (maps: Array<Map<string, unknown>>, tokenPath: string) =>
  maps.some((map) => map.has(tokenPath))

type SyncOptions = {
  transformPathSegments?: (pathSegments: string[]) => string[]
  transformValue?: (value: TokenLeafValue, sourcePath: string, sourceSegments: string[]) => TokenLeafValue
  includePath?: (sourcePath: string, sourceSegments: string[]) => boolean
}

export const syncObjectFromPathValues = (
  pathValues: Map<string, TokenLeafValue>,
  templateNode: unknown,
  options: SyncOptions = {},
) => {
  const out: JsonObject = {}
  const sortedPaths = [...pathValues.keys()].sort((a, b) => a.localeCompare(b))

  for (const sourcePath of sortedPaths) {
    const sourceValue = pathValues.get(sourcePath)
    if (!isLeafValue(sourceValue)) continue

    const sourceSegments = sourcePath.split('.').filter(Boolean)
    if (options.includePath && !options.includePath(sourcePath, sourceSegments)) continue

    const transformedSegments = options.transformPathSegments
      ? options.transformPathSegments(sourceSegments)
      : sourceSegments
    if (transformedSegments.length === 0) continue

    const transformedValue = options.transformValue
      ? options.transformValue(sourceValue, sourcePath, sourceSegments)
      : sourceValue

    const styledSegments = getStyledPathSegments(templateNode, transformedSegments)
    setDeep(out, styledSegments, transformedValue)
  }

  return sortObjectDeep(out) as JsonObject
}

export const buildStyledTreeFromPathValues = (
  pathValues: Map<string, TokenLeafValue>,
  templateNode: unknown,
  transformPathSegments?: (pathSegments: string[]) => string[],
) => syncObjectFromPathValues(pathValues, templateNode, { transformPathSegments })

export const buildTsAccessExpression = (root: string, segments: string[]): string =>
  segments.reduce((acc, segment) => `${acc}[${JSON.stringify(segment)}]`, root)

const toPrimitiveReferenceCandidate = (
  terminalPath: string,
  allowedRoots: Set<string>,
): { expression: string | null; isPrimitiveRoot: boolean } => {
  const segments = terminalPath.split('.').filter(Boolean)
  if (segments.length === 0) return { expression: null, isPrimitiveRoot: false }

  const [rawRoot, ...rest] = segments
  const pluralMap: Record<string, string> = {
    Orange: 'Oranges',
    Oranges: 'Oranges',
    Violet: 'Violets',
    Violets: 'Violets',
    Yellow: 'Yellows',
    Yellows: 'Yellows',
  }

  const root = pluralMap[rawRoot] ?? rawRoot
  if (!allowedRoots.has(root)) return { expression: null, isPrimitiveRoot: false }

  if (root === 'Transparent' && rest.length === 0) {
    return { expression: 'Transparent', isPrimitiveRoot: true }
  }

  if (rest.length === 0) return { expression: root, isPrimitiveRoot: true }
  return { expression: buildTsAccessExpression(root, rest), isPrimitiveRoot: true }
}

export const asPrimitiveExpressionLeaf = (
  leaf: TokenLeafValue,
  terminalPath: string,
  allowedRoots: Set<string>,
  warnings?: WarningCollector,
  warningContext?: string,
): TokenLeafValue => {
  if (typeof leaf !== 'string') return leaf
  const candidate = toPrimitiveReferenceCandidate(terminalPath, allowedRoots)
  const expression = candidate.expression
  if (!expression && candidate.isPrimitiveRoot && warnings) {
    warnings.warn({
      code: 'reference-fallback',
      context: warningContext,
      message: `Unable to map primitive alias '${terminalPath}' to a TypeScript reference. Falling back to literal value.`,
    })
  }
  return expression ? markExpr(expression) : leaf
}

const buildValueToPrimitiveReferenceMap = (
  primitiveNode: unknown,
  rootName: 'Spacing' | 'Sizing',
): Map<string, string> => {
  const out = new Map<string, string>()
  if (!primitiveNode || typeof primitiveNode !== 'object' || Array.isArray(primitiveNode)) return out

  for (const [tokenKey, tokenValue] of Object.entries(primitiveNode as JsonObject)) {
    if (typeof tokenValue !== 'string') continue
    if (out.has(tokenValue)) continue
    out.set(tokenValue, buildTsAccessExpression(rootName, [tokenKey]))
  }

  return out
}

export const withSizePrimitiveReferences = (sizesAndSpaces: JsonObject, primitives: JsonObject): JsonObject => {
  const out = cloneJson(sizesAndSpaces)
  const spacingRefs = buildValueToPrimitiveReferenceMap(primitives.Spacing, 'Spacing')
  const sizingRefs = buildValueToPrimitiveReferenceMap(primitives.Sizing, 'Sizing')

  const chooseExpression = (root: string, value: string): string | null => {
    const preferSpacingRoots = new Set(['Spacing', 'Grid'])
    const preferred = preferSpacingRoots.has(root) ? spacingRefs : sizingRefs
    const secondary = preferSpacingRoots.has(root) ? sizingRefs : spacingRefs
    return preferred.get(value) ?? secondary.get(value) ?? null
  }

  const leaves = collectLeafPaths(out)
  for (const leaf of leaves) {
    if (typeof leaf.value !== 'string') continue
    const [root] = leaf.path
    if (!root) continue
    const expression = chooseExpression(root, leaf.value)
    if (!expression) continue
    setDeep(out, leaf.path, markExpr(expression))
  }

  return out
}

export const withThemeSurfaceReferences = (
  themeTokens: Record<ThemeName, JsonObject>,
  surfacesPlain: Record<'Light' | 'Dark' | 'Chad', unknown>,
): Record<ThemeName, JsonObject> => {
  const out = cloneJson(themeTokens)

  const themeCase: Record<ThemeName, 'Light' | 'Dark' | 'Chad'> = {
    light: 'Light',
    dark: 'Dark',
    chad: 'Chad',
  }

  for (const theme of ['light', 'dark', 'chad'] as const) {
    const leaves = collectLeafPaths(out[theme])
    for (const leaf of leaves) {
      if (typeof leaf.value !== 'string') continue
      const surfaceValue = getDeep(surfacesPlain[themeCase[theme]], leaf.path)
      const valuesMatch =
        surfaceValue === leaf.value ||
        (isExprMarker(surfaceValue) &&
          isExprMarker(leaf.value) &&
          getExprFromMarker(surfaceValue) === getExprFromMarker(leaf.value))
      if (!valuesMatch) continue
      const surfaceRef = buildTsAccessExpression(`SurfacesAndText.plain.${themeCase[theme]}`, leaf.path)
      setDeep(out[theme], leaf.path, markExpr(surfaceRef))
    }
  }

  return out
}

export const toThemePrimitiveReference = (
  leaf: TokenLeafValue,
  terminalPath: string,
  warnings?: WarningCollector,
  warningContext?: string,
): TokenLeafValue => asPrimitiveExpressionLeaf(leaf, terminalPath, THEME_PRIMITIVE_ROOTS, warnings, warningContext)

export const toSurfacePrimitiveReference = (
  leaf: TokenLeafValue,
  terminalPath: string,
  warnings?: WarningCollector,
  warningContext?: string,
): TokenLeafValue => asPrimitiveExpressionLeaf(leaf, terminalPath, SURFACE_PRIMITIVE_ROOTS, warnings, warningContext)
