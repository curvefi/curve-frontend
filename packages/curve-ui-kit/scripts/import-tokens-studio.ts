import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { createBuildContext } from './tokens-studio/core.ts'
import { createResolver, getSet, loadTokensStudioExport, resolveThemeTokens } from './tokens-studio/extractors.ts'
import {
  applySectionUpdates,
  readMarkerObjectFromSource,
  renderConstDeclaration,
} from './tokens-studio/marker-writer.ts'
import {
  buildPrimitives,
  buildSizesAndSpaces,
  buildSurfacesPlain,
  buildThemeConstants,
  buildThemeTokensWithReferences,
  buildTypographyVariants,
} from './tokens-studio/pipelines/index.ts'
import { createWarningCollector } from './tokens-studio/sd-runtime.ts'
import { DESIGN_FILES } from './tokens-studio/types.ts'
import type { CliOptions, DesignFileKey, JsonObject, ThemeName } from './tokens-studio/types.ts'

const SECTION_ORDER: DesignFileKey[] = [
  'primitives',
  'sizesAndSpaces',
  'surfacesPlain',
  'themeConstants',
  'themeTokens',
  'typographyVariants',
]

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
      inputDir = value
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

const readTemplate = (sourceByFilePath: Map<string, string>, key: DesignFileKey): unknown => {
  const filePath = DESIGN_FILES[key].filePath
  const source = sourceByFilePath.get(filePath)
  if (source === undefined) throw new Error(`Could not load source file '${filePath}'`)

  return readMarkerObjectFromSource(
    source,
    filePath,
    DESIGN_FILES[key].constName,
    DESIGN_FILES[key].beginMarker,
    DESIGN_FILES[key].endMarker,
  )
}

const getBuilt = <T>(built: Partial<Record<DesignFileKey, unknown>>, key: DesignFileKey): T => {
  if (!(key in built)) throw new Error(`Internal builder error: missing section '${key}'`)
  return built[key] as T
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  const loaded = await loadTokensStudioExport(options.inputDir)
  const resolvedThemes = resolveThemeTokens(loaded.setMaps, loaded.themePayload)
  const context = createBuildContext(loaded.setMaps, resolvedThemes)
  const warnings = createWarningCollector()

  const targetFiles = [...new Set(SECTION_ORDER.map((key) => DESIGN_FILES[key].filePath))]
  const sourceByFilePath = new Map(
    await Promise.all(targetFiles.map(async (filePath) => [filePath, await readFile(filePath, 'utf8')])),
  )

  const templates = Object.fromEntries(
    SECTION_ORDER.map((key) => [key, readTemplate(sourceByFilePath, key)]),
  ) as Record<DesignFileKey, unknown>

  const primitivesBase = getSet(loaded.setMaps, '00_Primitives/Base')
  const primitivesResolver = createResolver(primitivesBase)

  const built: Partial<Record<DesignFileKey, unknown>> = {}
  for (const key of SECTION_ORDER) {
    switch (key) {
      case 'primitives':
        built[key] = buildPrimitives(templates.primitives as JsonObject, primitivesBase, primitivesResolver)
        break
      case 'sizesAndSpaces':
        built[key] = buildSizesAndSpaces(
          templates.sizesAndSpaces as JsonObject,
          loaded.setMaps,
          getBuilt<JsonObject>(built, 'primitives'),
        )
        break
      case 'surfacesPlain':
        built[key] = buildSurfacesPlain(
          templates.surfacesPlain as Record<'Light' | 'Dark' | 'Chad', unknown>,
          context,
          warnings,
        )
        break
      case 'themeConstants':
        built[key] = buildThemeConstants(
          templates.themeConstants as Record<ThemeName, unknown>,
          context,
          options.colorOnly,
          warnings,
        )
        break
      case 'themeTokens':
        built[key] = buildThemeTokensWithReferences(
          templates.themeTokens as Record<ThemeName, unknown>,
          context,
          options.colorOnly,
          getBuilt<Record<'Light' | 'Dark' | 'Chad', unknown>>(built, 'surfacesPlain'),
          warnings,
        )
        break
      case 'typographyVariants':
        built[key] = buildTypographyVariants(
          templates.typographyVariants as Record<string, unknown>,
          context,
          getBuilt<JsonObject>(built, 'sizesAndSpaces'),
        )
        break
      default:
        throw new Error(`Unhandled section '${key}'`)
    }
  }

  const sectionReplacements = Object.fromEntries(
    SECTION_ORDER.map((key) => [
      key,
      renderConstDeclaration(DESIGN_FILES[key].constName, getBuilt(built, key), DESIGN_FILES[key].exported),
    ]),
  ) as Record<DesignFileKey, string>

  const changed: string[] = []
  for (const filePath of targetFiles) {
    const existing = sourceByFilePath.get(filePath)
    if (existing === undefined) throw new Error(`Could not load source file '${filePath}'`)

    const updates = SECTION_ORDER.filter((key) => DESIGN_FILES[key].filePath === filePath).map((key) => ({
      beginMarker: DESIGN_FILES[key].beginMarker,
      endMarker: DESIGN_FILES[key].endMarker,
      content: sectionReplacements[key],
    }))

    const next = applySectionUpdates(existing, filePath, updates)
    if (next === existing) continue

    changed.push(filePath)
    if (options.write) await writeFile(filePath, next, 'utf8')
  }

  const warningList = warnings.list()
  if (warningList.length > 0) {
    console.warn(`Importer warnings (${warningList.length}):`)
    for (const warning of warningList) {
      console.warn(`- [${warning.code}] ${warning.context ? `${warning.context}: ` : ''}${warning.message}`)
    }
  }

  if (options.check) {
    if (changed.length > 0) {
      console.error('Design token files are out of date:')
      for (const file of changed) console.error(`- ${file}`)
      process.exitCode = 1
      return
    }

    console.info('Design token files are up to date.')
    return
  }

  if (options.write) {
    console.info(
      changed.length > 0 ? `Updated ${changed.length} design token file(s).` : 'No token file changes needed.',
    )
    return
  }

  console.info(changed.length > 0 ? `Dry run: ${changed.length} file(s) would change.` : 'Dry run: no changes needed.')
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
