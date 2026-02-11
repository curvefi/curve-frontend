import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type JsonObject = Record<string, unknown>
export type TokenLeafValue = string | number | boolean

export type ThemeDescriptor = {
  name: string
  selectedTokenSets?: Record<string, string>
  selectedTokensets?: Record<string, string>
}

export type ThemePayload = {
  themes: ThemeDescriptor[]
  tokenSetOrder: string[]
}

export type CliOptions = {
  inputDir: string
  write: boolean
  check: boolean
  colorOnly: boolean
}

export type TokenNode = {
  value: unknown
  type: string | null
  path: string
}

export type LoadedExport = {
  setMaps: Map<string, Map<string, TokenNode>>
  themePayload: ThemePayload
}

export type ResolvedPathInfo = {
  value: unknown
  type: string | null
  terminalPath: string
}

export type ImporterWarningCode = 'reference-fallback' | 'coerce-fallback' | 'optional-missing'

export type ImporterWarning = {
  code: ImporterWarningCode
  message: string
  context?: string
}

export type WarningCollector = {
  warn: (warning: ImporterWarning) => void
  list: () => ImporterWarning[]
}

export const REQUIRED_THEMES = ['light', 'dark', 'chad'] as const
export type ThemeName = (typeof REQUIRED_THEMES)[number]

export const ENABLED_STATUSES = new Set(['enabled', 'source'])

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
export const WORKSPACE_ROOT = resolve(SCRIPT_DIR, '../..')

export const EXPR_MARKER_PREFIX = '__TOKENS_STUDIO_EXPR__:'
export const markExpr = (expr: string): string => `${EXPR_MARKER_PREFIX}${expr}`
export const isExprMarker = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith(EXPR_MARKER_PREFIX)
export const getExprFromMarker = (value: string): string => value.slice(EXPR_MARKER_PREFIX.length)

export const SURFACE_PRIMITIVE_ROOTS = new Set([
  'Blues',
  'Grays',
  'Greens',
  'Oranges',
  'Reds',
  'Violets',
  'Yellows',
  'Transparent',
])
export const THEME_PRIMITIVE_ROOTS = new Set([
  'Blues',
  'Grays',
  'Greens',
  'Oranges',
  'Reds',
  'Violets',
  'Yellows',
  'Transparent',
])

export const REQUIRED_THEME_TOKEN_PATHS = (() => {
  const buttonShape: Record<string, Record<string, string[]>> = {
    Primary: {
      Default: ['Label & Icon', 'Fill'],
      Hover: ['Label & Icon', 'Fill'],
      Disabled: ['Label & Icon', 'Fill'],
    },
    Secondary: {
      Default: ['Label & Icon', 'Fill'],
      Hover: ['Label & Icon', 'Fill'],
      Disabled: ['Label & Icon', 'Fill'],
    },
    Outlined: {
      Default: ['Label & Icon', 'Outline'],
      Hover: ['Label & Icon', 'Outline'],
      Disabled: ['Label & Icon', 'Outline'],
    },
    Ghost: {
      Default: ['Label & Icon'],
      Hover: ['Label & Icon', 'Fill'],
      Disabled: ['Label & Icon', 'Fill'],
    },
    Success: {
      Default: ['Label & Icon', 'Fill'],
      Hover: ['Label & Icon', 'Fill'],
      Disabled: ['Label & Icon', 'Fill'],
    },
    Error: {
      Default: ['Label & Icon', 'Fill'],
      Hover: ['Label & Icon', 'Fill'],
      Disabled: ['Label & Icon', 'Fill'],
    },
    Navigation: {
      Default: ['Label & Icon'],
      Hover: ['Label & Icon', 'Fill'],
      Current: ['Label & Icon', 'Fill'],
    },
  }

  const paths = [
    'Text.Feedback.Inverted',
    'Button.Focus Outline Width',
    'Button.Focus Outline',
    'Button.Radius.xs',
    'Button.Radius.sm',
    'Button.Radius.md',
    'Button.Radius.lg',
  ]

  for (const [variant, states] of Object.entries(buttonShape)) {
    for (const [state, fields] of Object.entries(states)) {
      for (const field of fields) {
        paths.push(`Button.${variant}.${state}.${field}`)
      }
    }
  }

  return paths
})()

export const OPTIONAL_THEME_TOKEN_PATHS = new Set(['Text.Feedback.Inverted'])

export const DESIGN_FILES = {
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
  themeTokens: {
    constName: 'ImportedThemeTokens',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/design/2_theme.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_THEME_TOKENS */',
    endMarker: '/* TOKENS-STUDIO:END_THEME_TOKENS */',
    exported: false,
  },
  typographyVariants: {
    constName: 'TYPOGRAPHY_VARIANTS',
    filePath: resolve(WORKSPACE_ROOT, 'src/themes/typography.ts'),
    beginMarker: '/* TOKENS-STUDIO:BEGIN_TYPOGRAPHY_VARIANTS */',
    endMarker: '/* TOKENS-STUDIO:END_TYPOGRAPHY_VARIANTS */',
    exported: true,
  },
} as const

export type DesignFileKey = keyof typeof DESIGN_FILES
export const DESIGN_FILE_KEYS = Object.keys(DESIGN_FILES) as DesignFileKey[]
