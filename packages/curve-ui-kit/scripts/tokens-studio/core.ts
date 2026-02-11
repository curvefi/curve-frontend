import { createResolver } from './extractors.ts'
import { isLeafValue, normalizeDimension, normalizeFontWeight } from './sd-runtime.ts'
import { REQUIRED_THEMES } from './types.ts'
import type { ResolvedPathInfo, ThemeName, TokenLeafValue, TokenNode } from './types.ts'

export type ThemeContext = {
  name: ThemeName
  map: Map<string, TokenNode>
  resolver: ReturnType<typeof createResolver>
  sortedPaths: string[]
}

export type BuildContext = {
  setMaps: Map<string, Map<string, TokenNode>>
  themes: Record<ThemeName, ThemeContext>
}

const normalizeTokenByType = (value: unknown, type: string | null): unknown => {
  const normalizedType = type?.toLowerCase() ?? ''
  if (normalizedType.includes('fontweight')) return normalizeFontWeight(value)
  return /dimension|fontsize|lineheight|spacing|borderradius/.test(normalizedType) ? normalizeDimension(value) : value
}

export const createBuildContext = (
  setMaps: Map<string, Map<string, TokenNode>>,
  resolvedThemes: Record<ThemeName, Map<string, TokenNode>>,
): BuildContext => {
  const themes = {} as Record<ThemeName, ThemeContext>
  for (const name of REQUIRED_THEMES) {
    const map = resolvedThemes[name]
    themes[name] = {
      name,
      map,
      resolver: createResolver(map),
      sortedPaths: [...map.keys()].sort((a, b) => a.localeCompare(b)),
    }
  }

  return { setMaps, themes }
}

export const resolveLeafInfo = (resolver: ReturnType<typeof createResolver>, tokenPath: string): ResolvedPathInfo => {
  const info = resolver.resolvePathInfo(tokenPath)
  return {
    ...info,
    value: normalizeTokenByType(info.value, info.type),
  }
}

export const resolveLeafValue = (resolver: ReturnType<typeof createResolver>, tokenPath: string): TokenLeafValue => {
  const resolved = resolveLeafInfo(resolver, tokenPath).value
  if (!isLeafValue(resolved)) {
    throw new Error(`Token '${tokenPath}' must resolve to a string, number, or boolean`)
  }
  return resolved
}

export const coerceLeaf = (expected: TokenLeafValue, resolvedRaw: unknown, tokenPath: string): TokenLeafValue => {
  if (typeof expected === 'string') {
    if (typeof resolvedRaw !== 'string') throw new Error(`Token '${tokenPath}' must resolve to a string`)
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
    if (typeof resolvedRaw !== 'boolean') throw new Error(`Token '${tokenPath}' must resolve to a boolean`)
    return resolvedRaw
  }

  throw new Error(`Unsupported expected type at '${tokenPath}'`)
}

export const coerceLeafForTemplate = (expected: unknown, resolvedRaw: unknown, tokenPath: string): TokenLeafValue => {
  if (isLeafValue(expected)) return coerceLeaf(expected, resolvedRaw, tokenPath)
  if (isLeafValue(resolvedRaw)) return resolvedRaw
  throw new Error(`Token '${tokenPath}' must resolve to a string, number, or boolean`)
}
