import { coerceLeafForTemplate, resolveLeafValue } from '../core.ts'
import { createResolver, getSet, isObject } from '../extractors.ts'
import { BUTTON_HEIGHT_TO_SIZE, GRID_SPACING_KEYS } from '../mappings.ts'
import {
  collectSuffixes,
  getDeep,
  getStyledKey,
  getStyledPathSegments,
  hasAnyPath,
  setDeep,
  sortObjectDeep,
  syncObjectFromPathValues,
  withSizePrimitiveReferences,
} from '../reference-renderer.ts'
import { cloneJson, normalizeFontWeight } from '../sd-runtime.ts'
import type { JsonObject, TokenLeafValue, TokenNode } from '../types.ts'

const toValueMap = (set: Map<string, TokenNode>): Map<string, unknown> =>
  new Map([...set.entries()].map(([path, token]) => [path, token.value]))

const buildResponsiveGroup = (
  prefix: string,
  templateNode: unknown,
  sourceMaps: Array<Map<string, unknown>>,
  smResolver: ReturnType<typeof createResolver>,
  mdResolver: ReturnType<typeof createResolver>,
  lgResolver: ReturnType<typeof createResolver>,
) => {
  const out: JsonObject = {}

  for (const suffix of collectSuffixes(sourceMaps, prefix)) {
    const tokenPath = `${prefix}.${suffix}`
    const styledSegments = getStyledPathSegments(templateNode, suffix.split('.'))
    const expectedValue = getDeep(templateNode, styledSegments)
    const expectedMobile = isObject(expectedValue) ? expectedValue.mobile : undefined
    const expectedTablet = isObject(expectedValue) ? expectedValue.tablet : undefined
    const expectedDesktop = isObject(expectedValue) ? expectedValue.desktop : undefined

    setDeep(out, styledSegments, {
      mobile: coerceLeafForTemplate(expectedMobile, resolveLeafValue(smResolver, tokenPath), tokenPath),
      tablet: coerceLeafForTemplate(expectedTablet, resolveLeafValue(mdResolver, tokenPath), tokenPath),
      desktop: coerceLeafForTemplate(expectedDesktop, resolveLeafValue(lgResolver, tokenPath), tokenPath),
    })
  }

  return sortObjectDeep(out) as JsonObject
}

const buildScalarGroup = (
  prefix: string,
  templateNode: unknown,
  sourceMaps: Array<Map<string, unknown>>,
  resolver: ReturnType<typeof createResolver>,
) => {
  const pathValues = new Map<string, TokenLeafValue>()

  for (const suffix of collectSuffixes(sourceMaps, prefix)) {
    const tokenPath = `${prefix}.${suffix}`
    const styledSegments = getStyledPathSegments(templateNode, suffix.split('.'))
    const expectedValue = getDeep(templateNode, styledSegments)
    pathValues.set(suffix, coerceLeafForTemplate(expectedValue, resolveLeafValue(resolver, tokenPath), tokenPath))
  }

  return syncObjectFromPathValues(pathValues, templateNode)
}

export const buildSizesAndSpaces = (
  template: JsonObject,
  setMaps: Map<string, Map<string, TokenNode>>,
  primitives: JsonObject,
): JsonObject => {
  const base = getSet(setMaps, '00_Primitives/Base')
  const sm = getSet(setMaps, '01_Mapped_Sizes&Spaces/sm')
  const md = getSet(setMaps, '01_Mapped_Sizes&Spaces/md')
  const lg = getSet(setMaps, '01_Mapped_Sizes&Spaces/lg')

  const smResolver = createResolver(new Map([...base, ...sm]))
  const mdResolver = createResolver(new Map([...base, ...md]))
  const lgResolver = createResolver(new Map([...base, ...lg]))

  const mappedSources = [toValueMap(sm), toValueMap(md), toValueMap(lg)]
  const out = cloneJson(template)

  out.Spacing = buildResponsiveGroup('Spacing', out.Spacing, mappedSources, smResolver, mdResolver, lgResolver)
  out.Sizing = buildResponsiveGroup('Sizing', out.Sizing, mappedSources, smResolver, mdResolver, lgResolver)
  out.IconSize = buildResponsiveGroup('IconSize', out.IconSize, mappedSources, smResolver, mdResolver, lgResolver)
  out.FontSize = buildResponsiveGroup(
    'Typography.FontSize',
    out.FontSize,
    mappedSources,
    smResolver,
    mdResolver,
    lgResolver,
  )
  out.LineHeight = buildResponsiveGroup(
    'Typography.LineHeight',
    out.LineHeight,
    mappedSources,
    smResolver,
    mdResolver,
    lgResolver,
  )

  const fontWeightValues = new Map<string, TokenLeafValue>()
  for (const suffix of collectSuffixes(mappedSources, 'Typography.FontWeight')) {
    const tokenPath = `Typography.FontWeight.${suffix}`
    fontWeightValues.set(suffix, normalizeFontWeight(resolveLeafValue(mdResolver, tokenPath)))
  }
  out.FontWeight = syncObjectFromPathValues(fontWeightValues, out.FontWeight)

  const buttonSizeValues = new Map<string, TokenLeafValue>()
  for (const suffix of collectSuffixes(mappedSources, 'ButtonHeight')) {
    const targetSuffix = BUTTON_HEIGHT_TO_SIZE[suffix] ?? suffix
    buttonSizeValues.set(targetSuffix, resolveLeafValue(mdResolver, `ButtonHeight.${suffix}`))
  }
  out.ButtonSize = syncObjectFromPathValues(buttonSizeValues, out.ButtonSize)

  if (isObject(out.Width)) {
    const width = cloneJson(out.Width as JsonObject)
    width.modal = buildScalarGroup('ModalWidth', width.modal, mappedSources, mdResolver)
    out.Width = width
  }

  const gridTemplate = isObject(out.Grid) ? (out.Grid as JsonObject) : {}
  const grid = cloneJson(gridTemplate)

  for (const existingKey of Object.keys(gridTemplate)) {
    if (GRID_SPACING_KEYS.some((key) => getStyledKey(gridTemplate, key) === existingKey)) {
      delete grid[existingKey]
    }
  }

  for (const sourceGridKey of GRID_SPACING_KEYS) {
    const tokenPath = `Grid.${sourceGridKey}`
    if (!hasAnyPath(mappedSources, tokenPath)) continue

    const styledGridKey = getStyledKey(gridTemplate, sourceGridKey)
    grid[styledGridKey] = {
      mobile: resolveLeafValue(smResolver, tokenPath),
      tablet: resolveLeafValue(mdResolver, tokenPath),
      desktop: resolveLeafValue(lgResolver, tokenPath),
    }
  }

  out.Grid = sortObjectDeep(grid) as JsonObject
  return withSizePrimitiveReferences(out, primitives)
}
