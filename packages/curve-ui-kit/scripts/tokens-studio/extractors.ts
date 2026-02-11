import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { ENABLED_STATUSES, REQUIRED_THEMES } from './types.ts'
import type { LoadedExport, ResolvedPathInfo, ThemeDescriptor, ThemeName, ThemePayload, TokenNode } from './types.ts'

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isW3CTokenLeaf = (value: unknown): value is { $value: unknown; $type?: unknown } =>
  isObject(value) && '$value' in value

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
  relative(inputDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.json$/i, '')

const normalizeTokenType = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

const flattenTokenSet = (input: unknown, setName: string): Map<string, TokenNode> => {
  const out = new Map<string, TokenNode>()
  const legacyPaths: string[] = []

  const walk = (node: unknown, path: string[]) => {
    if (!isObject(node)) return

    if (isW3CTokenLeaf(node)) {
      const tokenPath = path.join('.')
      if (!tokenPath) throw new Error(`Invalid token leaf at root in set '${setName}'`)
      out.set(tokenPath, {
        value: node.$value,
        type: normalizeTokenType(node.$type),
        path: tokenPath,
      })
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

  const themes = themesCandidate.filter(
    (entry): entry is ThemeDescriptor => isObject(entry) && typeof entry.name === 'string',
  )

  const tokenSetOrder =
    (Array.isArray(value.tokenSetOrder) ? value.tokenSetOrder : null) ??
    (isObject(value.$metadata) && Array.isArray(value.$metadata.tokenSetOrder)
      ? value.$metadata.tokenSetOrder
      : null) ??
    []

  return {
    themes,
    tokenSetOrder: tokenSetOrder.filter((entry): entry is string => typeof entry === 'string'),
  }
}

export const loadTokensStudioExport = async (inputDir: string): Promise<LoadedExport> => {
  const jsonFiles = await collectJsonFiles(inputDir)
  if (jsonFiles.length === 0) {
    throw new Error(`No .json files found in input directory: ${inputDir}`)
  }

  const setMaps = new Map<string, Map<string, TokenNode>>()
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

const inferThemePayloadFromCurveExport = (
  setMaps: Map<string, Map<string, TokenNode>>,
  tokenSetOrder: string[],
): ThemePayload | null => {
  const hasCurveThemeSets = ['02_Theme/Light', '02_Theme/Dark', '02_Theme/Chad'].every((name) => setMaps.has(name))
  if (!hasCurveThemeSets) return null

  const sharedSets = [...setMaps.keys()].filter((name) => !name.startsWith('02_Theme/') && !/Inverted/i.test(name))

  const mk = (name: ThemeName, themeSet: string): ThemeDescriptor => ({
    name,
    selectedTokenSets: Object.fromEntries([...sharedSets, themeSet].map((setName) => [setName, 'enabled'])),
  })

  return {
    themes: [mk('light', '02_Theme/Light'), mk('dark', '02_Theme/Dark'), mk('chad', '02_Theme/Chad')],
    tokenSetOrder,
  }
}

export const resolveThemeTokens = (
  setMaps: Map<string, Map<string, TokenNode>>,
  rawThemePayload: ThemePayload,
): Record<ThemeName, Map<string, TokenNode>> => {
  const themePayload =
    rawThemePayload.themes.length > 0
      ? rawThemePayload
      : (inferThemePayloadFromCurveExport(setMaps, rawThemePayload.tokenSetOrder) ?? rawThemePayload)

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

  const resolveOne = (themeName: ThemeName) => {
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

    const merged = new Map<string, TokenNode>()
    for (const setName of sortedSets) {
      const set = setMaps.get(setName)
      if (!set) {
        throw new Error(`Theme '${theme.name}' references missing token set '${setName}'`)
      }
      for (const [tokenPath, token] of set.entries()) {
        merged.set(tokenPath, token)
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

export const createResolver = (map: Map<string, TokenNode>) => {
  const lowerIndex = new Map<string, string>()
  for (const key of map.keys()) {
    const lower = key.toLowerCase()
    if (!lowerIndex.has(lower)) lowerIndex.set(lower, key)
  }

  const cache = new Map<string, ResolvedPathInfo>()
  const refPattern = /^\{(.+)}$/

  const resolvePathInfo = (path: string, stack: string[] = []): ResolvedPathInfo => {
    const key = map.has(path) ? path : lowerIndex.get(path.toLowerCase())
    if (!key) {
      throw new Error(`Missing required token '${path}'`)
    }

    if (cache.has(key)) return cache.get(key)!

    if (stack.includes(key)) {
      throw new Error(`Circular token reference detected: ${[...stack, key].join(' -> ')}`)
    }

    const raw = map.get(key)
    if (!raw) {
      throw new Error(`Missing token payload for '${key}'`)
    }

    if (typeof raw.value === 'string') {
      const match = raw.value.match(refPattern)
      if (match) {
        const resolved = resolvePathInfo(match[1], [...stack, key])
        cache.set(key, resolved)
        return resolved
      }
    }

    const resolved: ResolvedPathInfo = {
      value: raw.value,
      type: raw.type,
      terminalPath: key,
    }
    cache.set(key, resolved)
    return resolved
  }

  const resolvePath = (path: string): unknown => resolvePathInfo(path).value

  return { resolvePath, resolvePathInfo }
}

export const getSet = (setMaps: Map<string, Map<string, TokenNode>>, name: string): Map<string, TokenNode> => {
  const found = setMaps.get(name)
  if (!found) {
    throw new Error(`Missing required token set '${name}'`)
  }
  return found
}
