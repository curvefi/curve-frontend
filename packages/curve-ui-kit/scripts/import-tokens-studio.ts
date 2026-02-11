import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
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
} from './tokens-studio/pipelines.ts'
import { createWarningCollector } from './tokens-studio/sd-runtime.ts'
import { DESIGN_FILES, DESIGN_FILE_KEYS } from './tokens-studio/types.ts'
import type { CliOptions, DesignFileKey, JsonObject, ThemeName } from './tokens-studio/types.ts'

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
  if (source === undefined) {
    throw new Error(`Could not load source file '${filePath}'`)
  }

  return readMarkerObjectFromSource(
    source,
    filePath,
    DESIGN_FILES[key].constName,
    DESIGN_FILES[key].beginMarker,
    DESIGN_FILES[key].endMarker,
  )
}

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  const loaded = await loadTokensStudioExport(options.inputDir)
  const resolvedThemes = resolveThemeTokens(loaded.setMaps, loaded.themePayload)
  const warnings = createWarningCollector()

  const targetFiles = [...new Set(DESIGN_FILE_KEYS.map((key) => DESIGN_FILES[key].filePath))]
  const sourceByFilePath = new Map(
    await Promise.all(targetFiles.map(async (filePath) => [filePath, await readFile(filePath, 'utf8')])),
  )

  const primitivesTemplate = readTemplate(sourceByFilePath, 'primitives') as JsonObject
  const sizesTemplate = readTemplate(sourceByFilePath, 'sizesAndSpaces') as JsonObject
  const surfacesTemplate = readTemplate(sourceByFilePath, 'surfacesPlain') as Record<'Light' | 'Dark' | 'Chad', unknown>
  const constantsTemplate = readTemplate(sourceByFilePath, 'themeConstants') as Record<ThemeName, unknown>
  const themeTokensTemplate = readTemplate(sourceByFilePath, 'themeTokens') as Record<ThemeName, unknown>
  const typographyVariantsTemplate = readTemplate(sourceByFilePath, 'typographyVariants') as Record<string, unknown>

  const primitivesBase = getSet(loaded.setMaps, '00_Primitives/Base')
  const primitivesResolver = createResolver(primitivesBase)

  const primitives = buildPrimitives(primitivesTemplate, primitivesBase, primitivesResolver)
  const sizesAndSpaces = buildSizesAndSpaces(sizesTemplate, loaded.setMaps, primitives)
  const surfacesPlain = buildSurfacesPlain(surfacesTemplate, loaded.setMaps, resolvedThemes, warnings)
  const themeConstants = buildThemeConstants(constantsTemplate, resolvedThemes, options.colorOnly, warnings)
  const themeTokens = buildThemeTokensWithReferences(
    themeTokensTemplate,
    resolvedThemes,
    options.colorOnly,
    surfacesPlain,
    warnings,
  )
  const typographyVariants = buildTypographyVariants(typographyVariantsTemplate, resolvedThemes, sizesAndSpaces)

  const computedValues = {
    primitives,
    sizesAndSpaces,
    surfacesPlain,
    themeConstants,
    themeTokens,
    typographyVariants,
  } satisfies Record<DesignFileKey, unknown>

  const sectionReplacements = {
    primitives: renderConstDeclaration(
      DESIGN_FILES.primitives.constName,
      computedValues.primitives,
      DESIGN_FILES.primitives.exported,
    ),
    sizesAndSpaces: renderConstDeclaration(
      DESIGN_FILES.sizesAndSpaces.constName,
      computedValues.sizesAndSpaces,
      DESIGN_FILES.sizesAndSpaces.exported,
    ),
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
    themeTokens: renderConstDeclaration(
      DESIGN_FILES.themeTokens.constName,
      computedValues.themeTokens,
      DESIGN_FILES.themeTokens.exported,
    ),
    typographyVariants: renderConstDeclaration(
      DESIGN_FILES.typographyVariants.constName,
      computedValues.typographyVariants,
      DESIGN_FILES.typographyVariants.exported,
    ),
  } satisfies Record<DesignFileKey, string>

  const changed: string[] = []

  for (const filePath of targetFiles) {
    const existing = sourceByFilePath.get(filePath)
    if (existing === undefined) throw new Error(`Could not load source file '${filePath}'`)

    const updates = DESIGN_FILE_KEYS.filter((key) => DESIGN_FILES[key].filePath === filePath).map((key) => ({
      beginMarker: DESIGN_FILES[key].beginMarker,
      endMarker: DESIGN_FILES[key].endMarker,
      content: sectionReplacements[key],
    }))

    const next = applySectionUpdates(existing, filePath, updates)
    if (next === existing) continue

    changed.push(filePath)
    if (options.write) {
      await writeFile(filePath, next, 'utf8')
    }
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
