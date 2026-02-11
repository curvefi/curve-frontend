import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, extname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

type JsonObject = Record<string, unknown>
type TokenLeafValue = string | number | boolean

type ThemeDescriptor = {
  name: string
  selectedTokenSets?: Record<string, string>
  selectedTokensets?: Record<string, string>
}

type ThemePayload = {
  themes: ThemeDescriptor[]
  tokenSetOrder: string[]
}

type CliOptions = {
  inputDir: string
  write: boolean
  check: boolean
  colorOnly: boolean
}

type LoadedExport = {
  setMaps: Map<string, Map<string, unknown>>
  themePayload: ThemePayload
}

const REQUIRED_THEMES = ['light', 'dark', 'chad'] as const
const ENABLED_STATUSES = new Set(['enabled', 'source'])

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, '..')

const LEGACY_GENERATED_FILES = {
  primitives: {
    constName: 'GeneratedPrimitives',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/generated/primitives.generated.ts'),
  },
  sizesAndSpaces: {
    constName: 'GeneratedSizesAndSpaces',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/generated/sizes-spaces.generated.ts'),
  },
  surfacesPlain: {
    constName: 'GeneratedSurfacesPlain',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/generated/surfaces-plain.generated.ts'),
  },
  themeConstants: {
    constName: 'GeneratedThemeConstants',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/generated/theme-constants.generated.ts'),
  },
  themeFlat: {
    constName: 'GeneratedThemeFlat',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/generated/theme-flat.generated.ts'),
  },
} as const

const DESIGN_FILES = {
  primitives: {
    constName: 'Primitives',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/0_primitives.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_PRIMITIVES */',
    endMarker: '/* TOKENS-STUDIO:END_PRIMITIVES */',
    exported: true,
  },
  sizesAndSpaces: {
    constName: 'SizesAndSpaces',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/1_sizes_spaces.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_SIZES_SPACES */',
    endMarker: '/* TOKENS-STUDIO:END_SIZES_SPACES */',
    exported: true,
  },
  surfacesPlain: {
    constName: 'PlainSurfaces',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/1_surfaces_text.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_SURFACES_PLAIN */',
    endMarker: '/* TOKENS-STUDIO:END_SURFACES_PLAIN */',
    exported: false,
  },
  themeConstants: {
    constName: 'ImportedThemeConstants',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/2_theme.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_THEME_CONSTANTS */',
    endMarker: '/* TOKENS-STUDIO:END_THEME_CONSTANTS */',
    exported: false,
  },
  themeFlat: {
    constName: 'ImportedThemeFlat',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/2_theme.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_THEME_FLAT */',
    endMarker: '/* TOKENS-STUDIO:END_THEME_FLAT */',
    exported: false,
  },
} as const

const usage = () => {
  console.info(
    'Usage: node --experimental-strip-types scripts/import-tokens-studio.ts --input <export-folder> [--write|--check] [--colors-only|--all-tokens]',
  )
}

const parseArgs = (argv: string[]): CliOptions => {
  let inputDir = ''
  let write = false
  let check = false
  let colorOnly = true

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--input') {
      const value = argv[i + 1]
      if (!value) throw new Error('Missing value for --input')
      inputDir = resolve(value)
      i += 1
      continue
    }

    if (arg === '--write') {
      write = true
      continue
    }

    if (arg === '--check') {
      check = true
      continue
    }

    if (arg === '--colors-only') {
      colorOnly = true
      continue
    }

    if (arg === '--all-tokens') {
      colorOnly = false
      continue
    }

    if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!inputDir) throw new Error('Missing required --input <export-folder>')
  if (write && check) throw new Error('Use only one mode: --write or --check')

  return { inputDir, write, check, colorOnly }
}

const deepClone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

const isObject = (value: unknown): value is JsonObject => typeof value === 'object' && value !== null && !Array.isArray(value)

const isW3CTokenLeaf = (value: unknown): value is { $value: unknown; $type?: unknown } => isObject(value) && '$value' in value

const isLegacyTokenLeaf = (value: unknown): value is { value: unknown; type?: unknown } =>
  isObject(value) && 'value' in value && !('$value' in value)

const collectJsonFiles = async (root: string): Promise<string[]> => {
  const files: string[] = []

  const walk = async (dir: string) => {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
        continue
      }

      if (extname(entry.name).toLowerCase() === '.json') {
        files.push(fullPath)
      }
    }
  }

  await walk(root)
  files.sort((a, b) => a.localeCompare(b))
  return files
}

const normalizeSetName = (inputDir: string, filePath: string): string =>
  relative(inputDir, filePath).replace(/\\/g, '/').replace(/\.json$/i, '')

const flattenTokenSet = (input: unknown, setName: string): Map<string, unknown> => {
  const out = new Map<string, unknown>()
  const legacyPaths: string[] = []

  const walk = (node: unknown, path: string[]) => {
    if (!isObject(node)) return

    if (isW3CTokenLeaf(node)) {
      const tokenPath = path.join('.')
      if (!tokenPath) throw new Error(`Invalid token leaf at root in set '${setName}'`)
      out.set(tokenPath, node.$value)
      return
    }

    if (isLegacyTokenLeaf(node)) {
      legacyPaths.push(path.join('.'))
      return
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue
      walk(value, [...path, key])
    }
  }

  walk(input, [])

  if (legacyPaths.length > 0) {
    const sample = legacyPaths.find(Boolean) ?? '(root)'
    throw new Error(
      `Legacy token format detected in set '${setName}' (example path: ${sample}). Switch Tokens Studio to W3C/DTCG format ($value/$type).`,
    )
  }

  return out
}

const parseThemePayload = (value: unknown): ThemePayload | null => {
  if (Array.isArray(value)) {
    const themes = value.filter((entry): entry is ThemeDescriptor => isObject(entry) && typeof entry.name === 'string')
    return { themes, tokenSetOrder: [] }
  }

  if (!isObject(value)) return null

  const themesCandidate =
    (Array.isArray(value.$themes) ? value.$themes : null) ?? (Array.isArray(value.themes) ? value.themes : null)

  if (!themesCandidate) return null

  const themes = themesCandidate.filter((entry): entry is ThemeDescriptor => isObject(entry) && typeof entry.name === 'string')

  const tokenSetOrder =
    (Array.isArray(value.tokenSetOrder) ? value.tokenSetOrder : null) ??
    (isObject(value.$metadata) && Array.isArray(value.$metadata.tokenSetOrder) ? value.$metadata.tokenSetOrder : null) ??
    []

  return {
    themes,
    tokenSetOrder: tokenSetOrder.filter((entry): entry is string => typeof entry === 'string'),
  }
}

const loadTokensStudioExport = async (inputDir: string): Promise<LoadedExport> => {
  const jsonFiles = await collectJsonFiles(inputDir)
  if (jsonFiles.length === 0) {
    throw new Error(`No .json files found in input directory: ${inputDir}`)
  }

  const setMaps = new Map<string, Map<string, unknown>>()
  let themePayload: ThemePayload | null = null
  let metadataTokenSetOrder: string[] = []

  for (const filePath of jsonFiles) {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    const setName = normalizeSetName(inputDir, filePath)

    if (setName === '$metadata') {
      if (isObject(parsed) && Array.isArray(parsed.tokenSetOrder)) {
        metadataTokenSetOrder = parsed.tokenSetOrder.filter((entry): entry is string => typeof entry === 'string')
      }
      continue
    }

    if (setName === '$themes') {
      const parsedThemePayload = parseThemePayload(parsed)
      if (!parsedThemePayload) {
        throw new Error(`File '$themes.json' must contain a valid $themes payload`)
      }
      themePayload = parsedThemePayload
      continue
    }

    if (/aria/i.test(setName)) {
      console.info(`Skipping Aria token set '${setName}'`)
      continue
    }

    const flattened = flattenTokenSet(parsed, setName)
    if (flattened.size > 0) {
      setMaps.set(setName, flattened)
    }
  }

  if (setMaps.size === 0) {
    throw new Error('No non-Aria token sets with W3C tokens were found')
  }

  const finalThemePayload: ThemePayload = themePayload ?? { themes: [], tokenSetOrder: [] }
  if (finalThemePayload.tokenSetOrder.length === 0 && metadataTokenSetOrder.length > 0) {
    finalThemePayload.tokenSetOrder = metadataTokenSetOrder
  }

  return {
    setMaps,
    themePayload: finalThemePayload,
  }
}

const inferThemePayloadFromCurveExport = (setMaps: Map<string, Map<string, unknown>>, tokenSetOrder: string[]): ThemePayload | null => {
  const hasCurveThemeSets = ['02_Theme/Light', '02_Theme/Dark', '02_Theme/Chad'].every((name) => setMaps.has(name))
  if (!hasCurveThemeSets) return null

  const sharedSets = [...setMaps.keys()].filter((name) => !name.startsWith('02_Theme/') && !/Inverted/i.test(name))

  const mk = (name: 'light' | 'dark' | 'chad', themeSet: string): ThemeDescriptor => ({
    name,
    selectedTokenSets: Object.fromEntries([...sharedSets, themeSet].map((setName) => [setName, 'enabled'])),
  })

  return {
    themes: [mk('light', '02_Theme/Light'), mk('dark', '02_Theme/Dark'), mk('chad', '02_Theme/Chad')],
    tokenSetOrder,
  }
}

const resolveThemeTokens = (
  setMaps: Map<string, Map<string, unknown>>,
  rawThemePayload: ThemePayload,
): Record<'light' | 'dark' | 'chad', Map<string, unknown>> => {
  const themePayload =
    rawThemePayload.themes.length > 0
      ? rawThemePayload
      : inferThemePayloadFromCurveExport(setMaps, rawThemePayload.tokenSetOrder) ?? rawThemePayload

  const byLowerThemeName = new Map<string, ThemeDescriptor>()
  for (const theme of themePayload.themes) {
    byLowerThemeName.set(theme.name.toLowerCase(), theme)
  }

  const missingThemes = REQUIRED_THEMES.filter((themeName) => !byLowerThemeName.has(themeName))
  if (missingThemes.length > 0) {
    throw new Error(`Missing required themes in $themes: ${missingThemes.join(', ')}`)
  }

  const setOrder = themePayload.tokenSetOrder.length > 0 ? themePayload.tokenSetOrder : [...setMaps.keys()].sort()
  const orderIndex = new Map<string, number>()
  setOrder.forEach((name, index) => orderIndex.set(name, index))

  const resolveOne = (themeName: 'light' | 'dark' | 'chad') => {
    const theme = byLowerThemeName.get(themeName)
    if (!theme) throw new Error(`Theme '${themeName}' not found`) 

    const statusMap = theme.selectedTokenSets ?? theme.selectedTokensets
    if (!statusMap || Object.keys(statusMap).length === 0) {
      throw new Error(`Theme '${theme.name}' has no selected token sets`)
    }

    const enabledSets = Object.entries(statusMap)
      .filter(([setName, status]) => {
        if (/aria/i.test(setName)) return false
        return ENABLED_STATUSES.has(String(status).toLowerCase())
      })
      .map(([setName]) => setName)

    if (enabledSets.length === 0) {
      throw new Error(`Theme '${theme.name}' has no enabled/source token sets`)
    }

    const sortedSets = [...new Set(enabledSets)].sort((a, b) => {
      const aOrder = orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER
      const bOrder = orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.localeCompare(b)
    })

    const merged = new Map<string, unknown>()
    for (const setName of sortedSets) {
      const set = setMaps.get(setName)
      if (!set) {
        throw new Error(`Theme '${theme.name}' references missing token set '${setName}'`)
      }
      for (const [tokenPath, value] of set.entries()) {
        merged.set(tokenPath, value)
      }
    }

    return merged
  }

  return {
    light: resolveOne('light'),
    dark: resolveOne('dark'),
    chad: resolveOne('chad'),
  }
}

const loadConstObject = async (filePath: string, constName: string): Promise<unknown> => {
  const source = await readFile(filePath, 'utf8')
  const marker = `export const ${constName} =`
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) {
    throw new Error(`Could not find '${marker}' in ${filePath}`)
  }

  const objectStart = source.indexOf('{', markerIndex)
  if (objectStart < 0) {
    throw new Error(`Could not locate object start for '${constName}' in ${filePath}`)
  }

  let depth = 0
  let objectEnd = -1
  for (let i = objectStart; i < source.length; i += 1) {
    const char = source[i]
    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        objectEnd = i
        break
      }
    }
  }

  if (objectEnd < 0) {
    throw new Error(`Could not locate object end for '${constName}' in ${filePath}`)
  }

  const literal = source.slice(objectStart, objectEnd + 1)
  return Function(`"use strict"; return (${literal});`)() as unknown
}

const isLeafValue = (value: unknown): value is TokenLeafValue =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

const isColorLikeValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized)) return true
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(/.test(normalized)) return true
  if (normalized === 'transparent') return true
  return /^var\(--/.test(normalized)
}

const createResolver = (map: Map<string, unknown>) => {
  const lowerIndex = new Map<string, string>()
  for (const key of map.keys()) {
    const lower = key.toLowerCase()
    if (!lowerIndex.has(lower)) lowerIndex.set(lower, key)
  }

  const cache = new Map<string, unknown>()
  const refPattern = /^\{(.+)}$/

  const resolvePath = (path: string, stack: string[] = []): unknown => {
    const key = map.has(path) ? path : lowerIndex.get(path.toLowerCase())
    if (!key) {
      throw new Error(`Missing required token '${path}'`)
    }

    if (cache.has(key)) return cache.get(key)

    if (stack.includes(key)) {
      throw new Error(`Circular token reference detected: ${[...stack, key].join(' -> ')}`)
    }

    const raw = map.get(key)
    if (typeof raw === 'string') {
      const match = raw.match(refPattern)
      if (match) {
        const resolved = resolvePath(match[1], [...stack, key])
        cache.set(key, resolved)
        return resolved
      }
    }

    cache.set(key, raw)
    return raw
  }

  return { resolvePath }
}

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

const walkTemplate = (
  template: unknown,
  makeTokenPath: (path: string[]) => string,
  resolver: ReturnType<typeof createResolver>,
  path: string[] = [],
): unknown => {
  if (isLeafValue(template)) {
    const tokenPath = makeTokenPath(path)
    const resolved = resolver.resolvePath(tokenPath)
    return coerceLeaf(template, resolved, tokenPath)
  }

  if (!isObject(template)) {
    throw new Error(`Unsupported template node at '${path.join('.')}'`)
  }

  const out: JsonObject = {}
  for (const [key, value] of Object.entries(template)) {
    out[key] = walkTemplate(value, makeTokenPath, resolver, [...path, key])
  }
  return out
}

const buildPrimitives = (
  template: JsonObject,
  primitiveMap: Map<string, unknown>,
  resolver: ReturnType<typeof createResolver>,
  colorOnly: boolean,
): JsonObject => {
  const missingFallbacks = new Set<string>()
  const optionalPrimitiveFallbacks = new Set(['Spacing.450', 'Sizing.450'])

  const mapPath = (path: string[]) => {
    const [first, ...rest] = path
    const mappedFirst =
      first === 'Oranges'
        ? 'Orange'
        : first === 'Violets'
          ? 'Violet'
          : first === 'Yellows'
            ? 'Yellow'
            : first
    return [mappedFirst, ...rest].join('.')
  }

  const visit = (node: unknown, path: string[] = []): unknown => {
    if (isLeafValue(node)) {
      if (colorOnly && (path[0] === 'Spacing' || path[0] === 'Sizing')) {
        return node
      }
      const tokenPath = mapPath(path)
      try {
        return coerceLeaf(node, resolver.resolvePath(tokenPath), tokenPath)
      } catch {
        if (!optionalPrimitiveFallbacks.has(tokenPath)) {
          missingFallbacks.add(tokenPath)
        }
        return node
      }
    }
    if (!isObject(node)) return node
    const out: JsonObject = {}
    for (const [key, value] of Object.entries(node)) {
      out[key] = visit(value, [...path, key])
    }
    return out
  }

  const result = visit(template) as JsonObject

  const nonColorPrimitiveKeys = new Set(['Spacing', 'Sizing', 'Transparent'])
  const pluralMap: Record<string, string> = {
    Orange: 'Oranges',
    Oranges: 'Oranges',
    Violet: 'Violets',
    Violets: 'Violets',
    Yellow: 'Yellows',
    Yellows: 'Yellows',
  }
  const isNumericShade = (value: string) => /^-?\d+(\.\d+)?$/.test(value)

  const dynamicColorFamilies = new Map<string, Map<string, string>>()

  for (const key of primitiveMap.keys()) {
    const parts = key.split('.')
    if (parts.length !== 2) continue
    const [familyRaw, shade] = parts
    if (nonColorPrimitiveKeys.has(familyRaw)) continue
    if (!isNumericShade(shade)) continue

    const family = pluralMap[familyRaw] ?? familyRaw
    const rawResolved = resolver.resolvePath(key)
    if (typeof rawResolved !== 'string') continue
    if (!isColorLikeValue(rawResolved)) continue

    if (!dynamicColorFamilies.has(family)) dynamicColorFamilies.set(family, new Map())
    dynamicColorFamilies.get(family)?.set(shade, rawResolved)
  }

  const shadeSort = (a: string, b: string) => Number(a) - Number(b)
  const toSortedRecord = (source: Map<string, string>): JsonObject =>
    Object.fromEntries([...source.entries()].sort(([a], [b]) => shadeSort(a, b)))

  for (const [family, shades] of dynamicColorFamilies.entries()) {
    result[family] = toSortedRecord(shades)
  }

  const managedShadeFamilies = Object.entries(result)
    .filter(([key, value]) => {
      if (nonColorPrimitiveKeys.has(key)) return false
      if (!isObject(value)) return false
      const shadeKeys = Object.keys(value)
      return shadeKeys.length > 0 && shadeKeys.every((shade) => isNumericShade(shade))
    })
    .map(([key]) => key)

  for (const family of managedShadeFamilies) {
    if (!dynamicColorFamilies.has(family)) {
      delete result[family]
    }
  }

  const effectiveMissingFallbacks = [...missingFallbacks].filter((tokenPath) => {
    const [family] = tokenPath.split('.')
    return family in result
  })

  if (effectiveMissingFallbacks.length > 0) {
    console.info(
      `Using baseline fallback for ${effectiveMissingFallbacks.length} primitive token(s): ${effectiveMissingFallbacks.join(', ')}`,
    )
  }

  return result
}

const getSet = (setMaps: Map<string, Map<string, unknown>>, name: string): Map<string, unknown> => {
  const found = setMaps.get(name)
  if (!found) {
    throw new Error(`Missing required token set '${name}'`) 
  }
  return found
}

const buildSizesAndSpaces = (template: JsonObject, setMaps: Map<string, Map<string, unknown>>): JsonObject => {
  const base = getSet(setMaps, '00_Primitives/Base')
  const sm = getSet(setMaps, '01_Mapped_Sizes&Spaces/sm')
  const md = getSet(setMaps, '01_Mapped_Sizes&Spaces/md')
  const lg = getSet(setMaps, '01_Mapped_Sizes&Spaces/lg')

  const smResolver = createResolver(new Map([...base, ...sm]))
  const mdResolver = createResolver(new Map([...base, ...md]))
  const lgResolver = createResolver(new Map([...base, ...lg]))

  const out = deepClone(template) as JsonObject

  const patchResponsive = (target: JsonObject, key: string, basePath: string) => {
    const node = target[key]
    if (!isObject(node)) return

    for (const [tokenKey, value] of Object.entries(node)) {
      if (!isObject(value)) continue
      const tokenPath = `${basePath}.${tokenKey}`
      ;(value as JsonObject).mobile = coerceLeaf((value as JsonObject).mobile as TokenLeafValue, smResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).tablet = coerceLeaf((value as JsonObject).tablet as TokenLeafValue, mdResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).desktop = coerceLeaf(
        (value as JsonObject).desktop as TokenLeafValue,
        lgResolver.resolvePath(tokenPath),
        tokenPath,
      )
    }
  }

  patchResponsive(out, 'Spacing', 'Spacing')
  patchResponsive(out, 'Sizing', 'Sizing')
  patchResponsive(out, 'IconSize', 'IconSize')

  const grid = out.Grid as JsonObject
  if (isObject(grid)) {
    ;(grid.Column_Spacing as JsonObject).mobile = coerceLeaf(
      (grid.Column_Spacing as JsonObject).mobile as TokenLeafValue,
      smResolver.resolvePath('Grid.Column Spacing'),
      'Grid.Column Spacing',
    )
    ;(grid.Column_Spacing as JsonObject).tablet = coerceLeaf(
      (grid.Column_Spacing as JsonObject).tablet as TokenLeafValue,
      mdResolver.resolvePath('Grid.Column Spacing'),
      'Grid.Column Spacing',
    )
    ;(grid.Column_Spacing as JsonObject).desktop = coerceLeaf(
      (grid.Column_Spacing as JsonObject).desktop as TokenLeafValue,
      lgResolver.resolvePath('Grid.Column Spacing'),
      'Grid.Column Spacing',
    )

    ;(grid.Row_Spacing as JsonObject).mobile = coerceLeaf(
      (grid.Row_Spacing as JsonObject).mobile as TokenLeafValue,
      smResolver.resolvePath('Grid.Row Spacing'),
      'Grid.Row Spacing',
    )
    ;(grid.Row_Spacing as JsonObject).tablet = coerceLeaf(
      (grid.Row_Spacing as JsonObject).tablet as TokenLeafValue,
      mdResolver.resolvePath('Grid.Row Spacing'),
      'Grid.Row Spacing',
    )
    ;(grid.Row_Spacing as JsonObject).desktop = coerceLeaf(
      (grid.Row_Spacing as JsonObject).desktop as TokenLeafValue,
      lgResolver.resolvePath('Grid.Row Spacing'),
      'Grid.Row Spacing',
    )
  }

  const buttonSize = out.ButtonSize as JsonObject
  if (isObject(buttonSize)) {
    const map: Record<string, string> = {
      xxs: 'ButtonHeight.XXS',
      xs: 'ButtonHeight.XS',
      sm: 'ButtonHeight.S',
      md: 'ButtonHeight.M',
      lg: 'ButtonHeight.L',
    }

    for (const [key, tokenPath] of Object.entries(map)) {
      const current = buttonSize[key] as TokenLeafValue
      buttonSize[key] = coerceLeaf(current, mdResolver.resolvePath(tokenPath), tokenPath)
    }
  }

  const fontSize = out.FontSize as JsonObject
  if (isObject(fontSize)) {
    for (const [key, value] of Object.entries(fontSize)) {
      if (!isObject(value)) continue
      const tokenPath = `Typography.FontSize.${key}`
      ;(value as JsonObject).mobile = coerceLeaf((value as JsonObject).mobile as TokenLeafValue, smResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).tablet = coerceLeaf((value as JsonObject).tablet as TokenLeafValue, mdResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).desktop = coerceLeaf(
        (value as JsonObject).desktop as TokenLeafValue,
        lgResolver.resolvePath(tokenPath),
        tokenPath,
      )
    }
  }

  const lineHeight = out.LineHeight as JsonObject
  if (isObject(lineHeight)) {
    for (const [key, value] of Object.entries(lineHeight)) {
      if (!isObject(value)) continue
      const tokenPath = `Typography.LineHeight.${key}`
      ;(value as JsonObject).mobile = coerceLeaf((value as JsonObject).mobile as TokenLeafValue, smResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).tablet = coerceLeaf((value as JsonObject).tablet as TokenLeafValue, mdResolver.resolvePath(tokenPath), tokenPath)
      ;(value as JsonObject).desktop = coerceLeaf(
        (value as JsonObject).desktop as TokenLeafValue,
        lgResolver.resolvePath(tokenPath),
        tokenPath,
      )
    }
  }

  const fontWeight = out.FontWeight as JsonObject
  if (isObject(fontWeight)) {
    const map: Record<string, string> = {
      Extra_Light: 'Typography.FontWeight.Extra Light',
      Light: 'Typography.FontWeight.Light',
      Normal: 'Typography.FontWeight.Normal',
      Medium: 'Typography.FontWeight.Medium',
      Semi_Bold: 'Typography.FontWeight.Semi Bold',
      Bold: 'Typography.FontWeight.Bold',
      Extra_Bold: 'Typography.FontWeight.Extra Bold',
    }

    for (const [key, tokenPath] of Object.entries(map)) {
      const current = fontWeight[key] as TokenLeafValue
      fontWeight[key] = coerceLeaf(current, mdResolver.resolvePath(tokenPath), tokenPath)
    }
  }

  const modalWidth = (out.Width as JsonObject)?.modal
  if (isObject(modalWidth)) {
    for (const key of Object.keys(modalWidth)) {
      const tokenPath = `ModalWidth.${key}`
      modalWidth[key] = coerceLeaf(modalWidth[key] as TokenLeafValue, mdResolver.resolvePath(tokenPath), tokenPath)
    }
  }

  return out
}

const buildSurfacesPlain = (
  template: Record<'Light' | 'Dark' | 'Chad', unknown>,
  resolvedThemes: Record<'light' | 'dark' | 'chad', Map<string, unknown>>,
): Record<'Light' | 'Dark' | 'Chad', unknown> => {
  const optionalSurfaceFallbackSuffixes = new Set(['Text.Feedback.Inverted'])

  const getSurfaceAliases = (themeLabel: 'Light' | 'Dark' | 'Chad', path: string[]): string[] => {
    if (path.length === 4 && path[0] === 'Tables' && path[1] === 'Header' && path[2] === 'Label') {
      return [`${themeLabel}.Tables.Header.Label & Icon.${path[3]}`]
    }
    return []
  }

  const shouldWarnSurfaceFallback = (path: string[]) => !optionalSurfaceFallbackSuffixes.has(path.join('.'))

  const buildOne = (themeLabel: 'Light' | 'Dark' | 'Chad', resolver: ReturnType<typeof createResolver>, node: unknown) => {
    const missingFallbacks = new Set<string>()

    const visit = (current: unknown, path: string[] = []): unknown => {
      if (isLeafValue(current)) {
        const tokenPath = [themeLabel, ...path].join('.')
        const tokenAliases = getSurfaceAliases(themeLabel, path)

        for (const candidate of [tokenPath, ...tokenAliases]) {
          try {
            return coerceLeaf(current, resolver.resolvePath(candidate), candidate)
          } catch {
            // try next alias
          }
        }

        if (path.join('.') === 'Text.Feedback.Inverted') {
          const fallbackPath = `${themeLabel}.Text.Primary`
          try {
            return coerceLeaf(current, resolver.resolvePath(fallbackPath), fallbackPath)
          } catch {
            // keep baseline fallback
          }
        }

        if (shouldWarnSurfaceFallback(path)) {
          missingFallbacks.add(tokenPath)
        }

        return current
      }

      if (!isObject(current)) return current

      const out: JsonObject = {}
      for (const [key, value] of Object.entries(current)) {
        out[key] = visit(value, [...path, key])
      }
      return out
    }

    const result = visit(node)
    if (missingFallbacks.size > 0) {
      console.info(
        `Using baseline fallback for ${missingFallbacks.size} ${themeLabel.toLowerCase()} surface token(s): ${[...missingFallbacks].join(', ')}`,
      )
    }
    return result
  }

  return {
    Light: buildOne('Light', createResolver(resolvedThemes.light), template.Light),
    Dark: buildOne('Dark', createResolver(resolvedThemes.dark), template.Dark),
    Chad: buildOne('Chad', createResolver(resolvedThemes.chad), template.Chad),
  }
}

const buildThemeFlat = (
  resolvedThemes: Record<'light' | 'dark' | 'chad', Map<string, unknown>>,
  colorOnly: boolean,
): Record<'light' | 'dark' | 'chad', Record<string, TokenLeafValue>> => {
  const out: Record<'light' | 'dark' | 'chad', Record<string, TokenLeafValue>> = {
    light: {},
    dark: {},
    chad: {},
  }

  for (const theme of REQUIRED_THEMES) {
    const resolver = createResolver(resolvedThemes[theme])
    const keys = [...resolvedThemes[theme].keys()].sort((a, b) => a.localeCompare(b))

    for (const key of keys) {
      const resolved = resolver.resolvePath(key)
      if (isLeafValue(resolved)) {
        if (colorOnly) {
          if (typeof resolved !== 'string' || !isColorLikeValue(resolved)) continue
        }
        out[theme][key] = resolved
      }
    }
  }

  return out
}

const mergeColorOnlyThemeFlat = (
  template: Record<'light' | 'dark' | 'chad', unknown>,
  colorUpdates: Record<'light' | 'dark' | 'chad', Record<string, TokenLeafValue>>,
): Record<'light' | 'dark' | 'chad', Record<string, TokenLeafValue>> => {
  const out: Record<'light' | 'dark' | 'chad', Record<string, TokenLeafValue>> = {
    light: {},
    dark: {},
    chad: {},
  }

  for (const theme of REQUIRED_THEMES) {
    const base = isObject(template[theme]) ? ({ ...(template[theme] as Record<string, TokenLeafValue>) } as Record<string, TokenLeafValue>) : {}

    for (const [key, value] of Object.entries(base)) {
      if (typeof value === 'string' && isColorLikeValue(value) && !(key in colorUpdates[theme])) {
        delete base[key]
      }
    }

    for (const [key, value] of Object.entries(colorUpdates[theme])) {
      base[key] = value
    }

    out[theme] = Object.fromEntries(Object.entries(base).sort(([a], [b]) => a.localeCompare(b)))
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
    return coerceLeaf(expected, resolver.resolvePath(tokenPath), tokenPath)
  } catch {
    return fallback as TokenLeafValue
  }
}

const buildThemeConstants = (
  template: Record<'light' | 'dark' | 'chad', unknown>,
  resolvedThemes: Record<'light' | 'dark' | 'chad', Map<string, unknown>>,
  colorOnly: boolean,
): Record<'light' | 'dark' | 'chad', unknown> => {
  const out = deepClone(template) as Record<'light' | 'dark' | 'chad', JsonObject>

  for (const theme of REQUIRED_THEMES) {
    const resolver = createResolver(resolvedThemes[theme])
    const node = out[theme] as JsonObject

    node.appBackground = coerceLeaf(node.appBackground as TokenLeafValue, resolver.resolvePath('Layer.App.Background'), 'Layer.App.Background')

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

const renderConstDeclaration = (constName: string, value: unknown, exported: boolean): string =>
  `${exported ? 'export ' : ''}const ${constName} = ${JSON.stringify(value, null, 2)} as const`

const replaceMarkedSection = (
  source: string,
  beginMarker: string,
  endMarker: string,
  sectionContent: string,
  filePath: string,
): string => {
  const beginIndex = source.indexOf(beginMarker)
  if (beginIndex < 0) throw new Error(`Missing marker '${beginMarker}' in ${filePath}`)

  const endIndex = source.indexOf(endMarker)
  if (endIndex < 0) throw new Error(`Missing marker '${endMarker}' in ${filePath}`)
  if (endIndex <= beginIndex) throw new Error(`Invalid marker ordering in ${filePath}: '${beginMarker}' before '${endMarker}'`)

  const before = source.slice(0, beginIndex + beginMarker.length)
  const after = source.slice(endIndex)
  return `${before}\n${sectionContent}\n${after}`
}

const loadTemplateWithFallback = async (primaryPath: string, primaryConst: string, fallbackPath: string, fallbackConst: string): Promise<unknown> => {
  try {
    const primary = await loadConstObject(primaryPath, primaryConst)
    if (isObject(primary) && Object.keys(primary).length > 0) return primary
  } catch {
    // fallback to legacy generated template
  }
  return loadConstObject(fallbackPath, fallbackConst)
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  const loaded = await loadTokensStudioExport(options.inputDir)
  const resolvedThemes = resolveThemeTokens(loaded.setMaps, loaded.themePayload)

  const primitivesTemplate = (await loadTemplateWithFallback(
    DESIGN_FILES.primitives.filePath,
    DESIGN_FILES.primitives.constName,
    LEGACY_GENERATED_FILES.primitives.filePath,
    LEGACY_GENERATED_FILES.primitives.constName,
  )) as JsonObject
  const sizesTemplate = (await loadTemplateWithFallback(
    DESIGN_FILES.sizesAndSpaces.filePath,
    DESIGN_FILES.sizesAndSpaces.constName,
    LEGACY_GENERATED_FILES.sizesAndSpaces.filePath,
    LEGACY_GENERATED_FILES.sizesAndSpaces.constName,
  )) as JsonObject
  const surfacesTemplate = (await loadTemplateWithFallback(
    DESIGN_FILES.surfacesPlain.filePath,
    DESIGN_FILES.surfacesPlain.constName,
    LEGACY_GENERATED_FILES.surfacesPlain.filePath,
    LEGACY_GENERATED_FILES.surfacesPlain.constName,
  )) as Record<'Light' | 'Dark' | 'Chad', unknown>
  const constantsTemplate = (await loadTemplateWithFallback(
    DESIGN_FILES.themeConstants.filePath,
    DESIGN_FILES.themeConstants.constName,
    LEGACY_GENERATED_FILES.themeConstants.filePath,
    LEGACY_GENERATED_FILES.themeConstants.constName,
  )) as Record<'light' | 'dark' | 'chad', unknown>
  const themeFlatTemplate = (await loadTemplateWithFallback(
    DESIGN_FILES.themeFlat.filePath,
    DESIGN_FILES.themeFlat.constName,
    LEGACY_GENERATED_FILES.themeFlat.filePath,
    LEGACY_GENERATED_FILES.themeFlat.constName,
  )) as Record<'light' | 'dark' | 'chad', unknown>

  const lightResolver = createResolver(resolvedThemes.light)
  const computedThemeFlat = buildThemeFlat(resolvedThemes, options.colorOnly)
  const computedValues = {
    primitives: buildPrimitives(primitivesTemplate, resolvedThemes.light, lightResolver, options.colorOnly),
    sizesAndSpaces: buildSizesAndSpaces(sizesTemplate, loaded.setMaps),
    surfacesPlain: buildSurfacesPlain(surfacesTemplate, resolvedThemes),
    themeConstants: buildThemeConstants(constantsTemplate, resolvedThemes, options.colorOnly),
    themeFlat: options.colorOnly ? mergeColorOnlyThemeFlat(themeFlatTemplate, computedThemeFlat) : computedThemeFlat,
  } as const

  const sectionReplacements = {
    primitives: renderConstDeclaration(DESIGN_FILES.primitives.constName, computedValues.primitives, DESIGN_FILES.primitives.exported),
    sizesAndSpaces: renderConstDeclaration(DESIGN_FILES.sizesAndSpaces.constName, computedValues.sizesAndSpaces, DESIGN_FILES.sizesAndSpaces.exported),
    surfacesPlain: renderConstDeclaration(
      DESIGN_FILES.surfacesPlain.constName,
      computedValues.surfacesPlain,
      DESIGN_FILES.surfacesPlain.exported,
    ),
    themeConstants: renderConstDeclaration(
      DESIGN_FILES.themeConstants.constName,
      computedValues.themeConstants,
      DESIGN_FILES.themeConstants.exported,
    ),
    themeFlat: renderConstDeclaration(DESIGN_FILES.themeFlat.constName, computedValues.themeFlat, DESIGN_FILES.themeFlat.exported),
  } as const

  const nextValues: Record<string, string> = {}

  const sourceFiles = new Set([
    DESIGN_FILES.primitives.filePath,
    DESIGN_FILES.sizesAndSpaces.filePath,
    DESIGN_FILES.surfacesPlain.filePath,
    DESIGN_FILES.themeConstants.filePath,
    DESIGN_FILES.themeFlat.filePath,
  ])

  for (const filePath of sourceFiles) {
    const existing = await readFile(filePath, 'utf8')
    let next = existing

    if (filePath === DESIGN_FILES.primitives.filePath) {
      next = replaceMarkedSection(
        next,
        DESIGN_FILES.primitives.beginMarker,
        DESIGN_FILES.primitives.endMarker,
        sectionReplacements.primitives,
        filePath,
      )
    }
    if (filePath === DESIGN_FILES.sizesAndSpaces.filePath) {
      next = replaceMarkedSection(
        next,
        DESIGN_FILES.sizesAndSpaces.beginMarker,
        DESIGN_FILES.sizesAndSpaces.endMarker,
        sectionReplacements.sizesAndSpaces,
        filePath,
      )
    }
    if (filePath === DESIGN_FILES.surfacesPlain.filePath) {
      next = replaceMarkedSection(
        next,
        DESIGN_FILES.surfacesPlain.beginMarker,
        DESIGN_FILES.surfacesPlain.endMarker,
        sectionReplacements.surfacesPlain,
        filePath,
      )
    }
    if (filePath === DESIGN_FILES.themeConstants.filePath) {
      next = replaceMarkedSection(
        next,
        DESIGN_FILES.themeConstants.beginMarker,
        DESIGN_FILES.themeConstants.endMarker,
        sectionReplacements.themeConstants,
        filePath,
      )
    }
    if (filePath === DESIGN_FILES.themeFlat.filePath) {
      next = replaceMarkedSection(
        next,
        DESIGN_FILES.themeFlat.beginMarker,
        DESIGN_FILES.themeFlat.endMarker,
        sectionReplacements.themeFlat,
        filePath,
      )
    }

    nextValues[filePath] = next
  }

  const changed: string[] = []

  for (const [filePath, content] of Object.entries(nextValues)) {
    let existing = ''
    try {
      existing = await readFile(filePath, 'utf8')
    } catch {
      existing = ''
    }

    if (existing !== content) {
      changed.push(filePath)
      if (options.write) {
        await writeFile(filePath, content, 'utf8')
      }
    }
  }

  if (options.check) {
    if (changed.length > 0) {
      console.error('Design token files are out of date:')
      for (const file of changed) {
        console.error(`- ${file}`)
      }
      process.exitCode = 1
      return
    }
    console.info('Design token files are up to date.')
    return
  }

  if (options.write) {
    console.info(changed.length > 0 ? `Updated ${changed.length} design token file(s).` : 'No token file changes needed.')
    return
  }

  console.info(changed.length > 0 ? `Dry run: ${changed.length} file(s) would change.` : 'Dry run: no changes needed.')
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
