import type { ImporterWarning, TokenLeafValue, WarningCollector } from './types.ts'

export const normalizeDimension = (value: unknown): string | number => {
  if (typeof value === 'number') return `${value}px`
  if (typeof value !== 'string') return String(value)

  const trimmed = value.trim()
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`
  }

  return trimmed
}

const FONT_WEIGHT_BY_NAME: Record<string, number> = {
  regular: 400,
  normal: 400,
  medium: 500,
  semibold: 600,
  semi_bold: 600,
  'semi bold': 600,
  bold: 700,
  extrabold: 800,
  extra_bold: 800,
  'extra bold': 800,
  light: 300,
  extralight: 200,
  extra_light: 200,
  'extra light': 200,
}

export const normalizeFontWeight = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()

    if (FONT_WEIGHT_BY_NAME[normalized] !== undefined) {
      return FONT_WEIGHT_BY_NAME[normalized]
    }

    const numeric = Number(normalized.replace(/px$/i, ''))
    if (Number.isFinite(numeric)) return numeric
  }

  throw new Error(`Unable to normalize font weight value '${String(value)}'`)
}

export const isLeafValue = (value: unknown): value is TokenLeafValue =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'

export const isColorLikeValue = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized)) return true
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\(/.test(normalized)) return true
  if (normalized === 'transparent') return true
  return /^var\(--/.test(normalized)
}

export const cloneJson = <T>(value: T): T => {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

export const createWarningCollector = (): WarningCollector => {
  const deduped = new Map<string, ImporterWarning>()

  const keyFor = (warning: ImporterWarning) => `${warning.code}|${warning.context ?? ''}|${warning.message}`

  return {
    warn: (warning: ImporterWarning) => {
      deduped.set(keyFor(warning), warning)
    },
    list: () =>
      [...deduped.values()].sort((a, b) => {
        const byCode = a.code.localeCompare(b.code)
        if (byCode !== 0) return byCode
        const byContext = (a.context ?? '').localeCompare(b.context ?? '')
        if (byContext !== 0) return byContext
        return a.message.localeCompare(b.message)
      }),
  }
}
