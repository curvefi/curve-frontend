import { resolveLeafInfo } from '../core.ts'
import type { BuildContext, ThemeContext } from '../core.ts'
import { getSet } from '../extractors.ts'
import { syncObjectFromPathValues, toSurfacePrimitiveReference } from '../reference-renderer.ts'
import { isLeafValue } from '../sd-runtime.ts'
import { THEME_LABEL_BY_NAME } from '../types.ts'
import type { TokenLeafValue, TokenNode, WarningCollector } from '../types.ts'

const buildOne = (
  context: ThemeContext,
  defaultSurfacesSet: Map<string, TokenNode>,
  templateNode: unknown,
  warnings?: WarningCollector,
) => {
  const themeLabel = THEME_LABEL_BY_NAME[context.name]
  const themePrefix = `${themeLabel}.`
  const pathValues = new Map<string, TokenLeafValue>()

  for (const sourcePath of [...defaultSurfacesSet.keys()].sort((a, b) => a.localeCompare(b))) {
    if (!sourcePath.startsWith(themePrefix)) continue

    const localPath = sourcePath.slice(themePrefix.length)
    if (!localPath) continue

    const resolvedInfo = resolveLeafInfo(context.resolver, sourcePath)
    if (!isLeafValue(resolvedInfo.value)) {
      throw new Error(`Token '${sourcePath}' must resolve to a string, number, or boolean`)
    }

    pathValues.set(
      localPath,
      toSurfacePrimitiveReference(
        resolvedInfo.value,
        resolvedInfo.terminalPath,
        warnings,
        `surfaces.${themeLabel}.${localPath}`,
      ),
    )
  }

  return syncObjectFromPathValues(pathValues, templateNode, {
    transformPathSegments: (segments) => {
      if (
        segments.length >= 4 &&
        segments[0] === 'Tables' &&
        segments[1] === 'Header' &&
        segments[2] === 'Label & Icon'
      ) {
        return ['Tables', 'Header', 'Label', ...segments.slice(3)]
      }
      return segments
    },
  })
}

export const buildSurfacesPlain = (
  template: Record<'Light' | 'Dark' | 'Chad', unknown>,
  context: BuildContext,
  warnings?: WarningCollector,
): Record<'Light' | 'Dark' | 'Chad', unknown> => {
  const defaultSurfacesSet = getSet(context.setMaps, '01_Surfaces&Text/Default')

  return {
    Light: buildOne(context.themes.light, defaultSurfacesSet, template.Light, warnings),
    Dark: buildOne(context.themes.dark, defaultSurfacesSet, template.Dark, warnings),
    Chad: buildOne(context.themes.chad, defaultSurfacesSet, template.Chad, warnings),
  }
}
