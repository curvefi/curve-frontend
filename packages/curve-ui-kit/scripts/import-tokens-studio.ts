import process from 'node:process'
import { createResolver, getSet, loadTokensStudioExport, resolveThemeTokens } from './tokens-studio/extractors.ts'
import { readMarkerObject, renderConstDeclaration, rewriteDesignFile } from './tokens-studio/marker-writer.ts'
import {
  buildPrimitives,
  buildSizesAndSpaces,
  buildSurfacesPlain,
  buildThemeConstants,
  buildThemeTokensWithReferences,
  buildTypographyVariants,
} from './tokens-studio/pipelines.ts'
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

const run = async () => {
  const options = parseArgs(process.argv.slice(2))
  const loaded = await loadTokensStudioExport(options.inputDir)
  const resolvedThemes = resolveThemeTokens(loaded.setMaps, loaded.themePayload)

  const primitivesTemplate = (await readMarkerObject(
    DESIGN_FILES.primitives.filePath,
    DESIGN_FILES.primitives.constName,
    DESIGN_FILES.primitives.beginMarker,
    DESIGN_FILES.primitives.endMarker,
  )) as JsonObject

  const sizesTemplate = (await readMarkerObject(
    DESIGN_FILES.sizesAndSpaces.filePath,
    DESIGN_FILES.sizesAndSpaces.constName,
    DESIGN_FILES.sizesAndSpaces.beginMarker,
    DESIGN_FILES.sizesAndSpaces.endMarker,
  )) as JsonObject

  const surfacesTemplate = (await readMarkerObject(
    DESIGN_FILES.surfacesPlain.filePath,
    DESIGN_FILES.surfacesPlain.constName,
    DESIGN_FILES.surfacesPlain.beginMarker,
    DESIGN_FILES.surfacesPlain.endMarker,
  )) as Record<'Light' | 'Dark' | 'Chad', unknown>

  const constantsTemplate = (await readMarkerObject(
    DESIGN_FILES.themeConstants.filePath,
    DESIGN_FILES.themeConstants.constName,
    DESIGN_FILES.themeConstants.beginMarker,
    DESIGN_FILES.themeConstants.endMarker,
  )) as Record<ThemeName, unknown>

  const themeTokensTemplate = (await readMarkerObject(
    DESIGN_FILES.themeTokens.filePath,
    DESIGN_FILES.themeTokens.constName,
    DESIGN_FILES.themeTokens.beginMarker,
    DESIGN_FILES.themeTokens.endMarker,
  )) as Record<ThemeName, unknown>

  const typographyVariantsTemplate = (await readMarkerObject(
    DESIGN_FILES.typographyVariants.filePath,
    DESIGN_FILES.typographyVariants.constName,
    DESIGN_FILES.typographyVariants.beginMarker,
    DESIGN_FILES.typographyVariants.endMarker,
  )) as Record<string, unknown>

  const primitivesBase = getSet(loaded.setMaps, '00_Primitives/Base')
  const primitivesResolver = createResolver(primitivesBase)

  const primitives = buildPrimitives(primitivesTemplate, primitivesBase, primitivesResolver)
  const sizesAndSpaces = buildSizesAndSpaces(sizesTemplate, loaded.setMaps, primitives)
  const surfacesPlain = buildSurfacesPlain(surfacesTemplate, loaded.setMaps, resolvedThemes)
  const themeConstants = buildThemeConstants(constantsTemplate, resolvedThemes, options.colorOnly)
  const themeTokens = buildThemeTokensWithReferences(
    themeTokensTemplate,
    resolvedThemes,
    options.colorOnly,
    surfacesPlain,
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

  const sourceFiles = new Set(DESIGN_FILE_KEYS.map((key) => DESIGN_FILES[key].filePath))
  const changed: string[] = []

  for (const filePath of sourceFiles) {
    const updates = DESIGN_FILE_KEYS.filter((key) => DESIGN_FILES[key].filePath === filePath).map((key) => ({
      beginMarker: DESIGN_FILES[key].beginMarker,
      endMarker: DESIGN_FILES[key].endMarker,
      content: sectionReplacements[key],
    }))

    const didChange = await rewriteDesignFile(filePath, updates, options.write)
    if (didChange) changed.push(filePath)
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
