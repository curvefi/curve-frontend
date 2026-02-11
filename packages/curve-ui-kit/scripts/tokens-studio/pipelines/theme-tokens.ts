import { resolveLeafInfo } from '../core.ts'
import type { BuildContext } from '../core.ts'
import { isObject } from '../extractors.ts'
import {
  normalizeKeyForMatch,
  setDeep,
  sortObjectDeep,
  syncObjectFromPathValues,
  toThemePrimitiveReference,
  withThemeSurfaceReferences,
} from '../reference-renderer.ts'
import { isColorLikeValue, isLeafValue } from '../sd-runtime.ts'
import {
  OPTIONAL_THEME_TOKEN_PATHS,
  REQUIRED_THEME_TOKEN_PATHS,
  REQUIRED_THEMES,
  THEME_LABEL_BY_NAME,
} from '../types.ts'
import type { JsonObject, ResolvedPathInfo, ThemeName, TokenLeafValue, WarningCollector } from '../types.ts'

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

  const currentPrefix = normalizeKeyForMatch(THEME_LABEL_BY_NAME[theme])
  const first = normalizeKeyForMatch(segments[0])
  const allPrefixes = new Set(Object.values(THEME_LABEL_BY_NAME).map((prefix) => normalizeKeyForMatch(prefix)))

  if (first === currentPrefix) return segments.slice(1).join('.')
  if (allPrefixes.has(first)) return null
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

    if (typeof child === 'string' && isColorLikeValue(child)) continue
    out[key] = child
  }

  return out
}

const mergeLeaves = (base: JsonObject, updates: JsonObject): JsonObject => {
  const out: JsonObject = { ...base }

  for (const [key, value] of Object.entries(updates)) {
    if (isObject(value) && isObject(out[key])) {
      out[key] = mergeLeaves(out[key] as JsonObject, value)
    } else {
      out[key] = value
    }
  }

  return out
}

export const buildThemeTokens = (
  template: Record<ThemeName, unknown>,
  context: BuildContext,
  colorOnly: boolean,
  warnings?: WarningCollector,
): Record<ThemeName, JsonObject> => {
  const out = {} as Record<ThemeName, JsonObject>

  for (const themeName of REQUIRED_THEMES) {
    const themeContext = context.themes[themeName]
    const { name, resolver, sortedPaths } = themeContext
    const label = THEME_LABEL_BY_NAME[name]
    const missingRequired: string[] = []
    const pathValues = new Map<string, TokenLeafValue>()
    const templateNode = normalizeThemeTemplateNode(template[name])

    for (const key of REQUIRED_THEME_TOKEN_PATHS) {
      let resolvedInfo: ResolvedPathInfo | null = null

      for (const candidate of [key, `${label}.${key}`]) {
        try {
          resolvedInfo = resolveLeafInfo(resolver, candidate)
          break
        } catch {
          // try next candidate
        }
      }

      if (!resolvedInfo) {
        if (!OPTIONAL_THEME_TOKEN_PATHS.has(key)) {
          missingRequired.push(key)
        } else if (warnings) {
          warnings.warn({
            code: 'optional-missing',
            context: `theme.${name}.${key}`,
            message: `Optional token path '${key}' is missing for theme '${name}'.`,
          })
        }
        continue
      }

      if (!isLeafValue(resolvedInfo.value)) continue
      if (colorOnly && (typeof resolvedInfo.value !== 'string' || !isColorLikeValue(resolvedInfo.value))) continue

      pathValues.set(
        key,
        toThemePrimitiveReference(resolvedInfo.value, resolvedInfo.terminalPath, warnings, `theme.${name}.${key}`),
      )
    }

    for (const sourcePath of sortedPaths) {
      const localPath = toLocalThemePath(name, sourcePath)
      if (!localPath) continue

      const resolvedInfo = resolveLeafInfo(resolver, sourcePath)
      if (!isLeafValue(resolvedInfo.value)) continue
      if (colorOnly && (typeof resolvedInfo.value !== 'string' || !isColorLikeValue(resolvedInfo.value))) continue

      pathValues.set(
        localPath,
        toThemePrimitiveReference(
          resolvedInfo.value,
          resolvedInfo.terminalPath,
          warnings,
          `theme.${name}.${localPath}`,
        ),
      )
    }

    if (missingRequired.length > 0) {
      throw new Error(`Missing required runtime token(s) for theme '${name}': ${missingRequired.join(', ')}`)
    }

    out[themeName] = syncObjectFromPathValues(pathValues, templateNode)
  }

  return out
}

export const mergeColorOnlyThemeTokens = (
  template: Record<ThemeName, unknown>,
  colorUpdates: Record<ThemeName, JsonObject>,
): Record<ThemeName, JsonObject> =>
  Object.fromEntries(
    (Object.keys(THEME_LABEL_BY_NAME) as ThemeName[]).map((theme) => {
      const templateNode = normalizeThemeTemplateNode(template[theme])
      const nonColorTemplate = removeColorLeaves(templateNode)
      const merged = mergeLeaves(isObject(nonColorTemplate) ? nonColorTemplate : {}, colorUpdates[theme])
      return [theme, sortObjectDeep(merged) as JsonObject]
    }),
  ) as Record<ThemeName, JsonObject>

export const buildThemeTokensWithReferences = (
  template: Record<ThemeName, unknown>,
  context: BuildContext,
  colorOnly: boolean,
  surfacesPlain: Record<'Light' | 'Dark' | 'Chad', unknown>,
  warnings?: WarningCollector,
): Record<ThemeName, JsonObject> => {
  const computedThemeTokens = buildThemeTokens(template, context, colorOnly, warnings)
  const mergedThemeTokens = colorOnly ? mergeColorOnlyThemeTokens(template, computedThemeTokens) : computedThemeTokens
  return withThemeSurfaceReferences(mergedThemeTokens, surfacesPlain)
}
