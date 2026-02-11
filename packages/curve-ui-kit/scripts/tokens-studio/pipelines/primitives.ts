import { resolveLeafValue } from '../core.ts'
import { createResolver } from '../extractors.ts'
import { LEGACY_PRIMITIVE_FALLBACKS, PRIMITIVE_ROOT_ALIASES } from '../mappings.ts'
import {
  getDeep,
  getStyledPathSegments,
  setDeep,
  sortObjectDeep,
  syncObjectFromPathValues,
} from '../reference-renderer.ts'
import type { JsonObject, TokenLeafValue, TokenNode } from '../types.ts'

export const buildPrimitives = (
  template: JsonObject,
  primitiveBaseMap: Map<string, TokenNode>,
  resolver: ReturnType<typeof createResolver>,
): JsonObject => {
  const pathValues = new Map<string, TokenLeafValue>()
  for (const tokenPath of primitiveBaseMap.keys()) {
    pathValues.set(tokenPath, resolveLeafValue(resolver, tokenPath))
  }

  const result = syncObjectFromPathValues(pathValues, template, {
    transformPathSegments: (sourceSegments) => {
      if (sourceSegments.length === 0) return sourceSegments
      const [first, ...rest] = sourceSegments
      const mappedFirst = PRIMITIVE_ROOT_ALIASES[first] ?? first
      return [mappedFirst, ...rest]
    },
  })

  for (const [optionalPath, fallbackValue] of Object.entries(LEGACY_PRIMITIVE_FALLBACKS)) {
    const styledSegments = getStyledPathSegments(template, optionalPath.split('.'))
    if (getDeep(result, styledSegments) !== undefined) continue
    setDeep(result, styledSegments, fallbackValue)
  }

  return sortObjectDeep(result) as JsonObject
}
