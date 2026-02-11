import { coerceLeaf, resolveLeafValue } from '../core.ts'
import type { BuildContext } from '../core.ts'
import { isObject } from '../extractors.ts'
import { cloneJson } from '../sd-runtime.ts'
import { REQUIRED_THEMES } from '../types.ts'
import type { JsonObject, ThemeName, TokenLeafValue, WarningCollector } from '../types.ts'

const tryResolveOptional = (
  tokenPath: string,
  fallback: unknown,
  expected: TokenLeafValue,
  resolve: (path: string) => TokenLeafValue,
  warnings?: WarningCollector,
  warningContext?: string,
): TokenLeafValue => {
  try {
    return coerceLeaf(expected, resolve(tokenPath), tokenPath)
  } catch {
    warnings?.warn({
      code: 'coerce-fallback',
      context: warningContext ?? tokenPath,
      message: `Using fallback value for '${tokenPath}' because source token could not be resolved/coerced.`,
    })
    return fallback as TokenLeafValue
  }
}

export const buildThemeConstants = (
  template: Record<ThemeName, unknown>,
  context: BuildContext,
  colorOnly: boolean,
  warnings?: WarningCollector,
): Record<ThemeName, unknown> => {
  const out = {} as Record<ThemeName, unknown>

  for (const themeName of REQUIRED_THEMES) {
    const themeContext = context.themes[themeName]
    const node = cloneJson(template[themeContext.name]) as JsonObject
    const resolve = (path: string) => resolveLeafValue(themeContext.resolver, path)

    node.appBackground = coerceLeaf(
      node.appBackground as TokenLeafValue,
      resolve('Layer.App.Background'),
      'Layer.App.Background',
    )

    if (colorOnly) return node

    const slider = node.slider as JsonObject
    if (!isObject(slider)) return node

    const defaults = slider.default as JsonObject
    const hover = slider.hover as JsonObject

    defaults.SliderThumbImage = tryResolveOptional(
      'Sliders.default.SliderThumbImage',
      defaults.SliderThumbImage,
      defaults.SliderThumbImage as TokenLeafValue,
      resolve,
      warnings,
      `theme-constants.${themeContext.name}.slider.default.SliderThumbImage`,
    )
    defaults.SliderThumbImageVertical = tryResolveOptional(
      'Sliders.default.SliderThumbImageVertical',
      defaults.SliderThumbImageVertical,
      defaults.SliderThumbImageVertical as TokenLeafValue,
      resolve,
      warnings,
      `theme-constants.${themeContext.name}.slider.default.SliderThumbImageVertical`,
    )
    hover.SliderThumbImage = tryResolveOptional(
      'Sliders.hover.SliderThumbImage',
      hover.SliderThumbImage,
      hover.SliderThumbImage as TokenLeafValue,
      resolve,
      warnings,
      `theme-constants.${themeContext.name}.slider.hover.SliderThumbImage`,
    )
    hover.SliderThumbImageVertical = tryResolveOptional(
      'Sliders.hover.SliderThumbImageVertical',
      hover.SliderThumbImageVertical,
      hover.SliderThumbImageVertical as TokenLeafValue,
      resolve,
      warnings,
      `theme-constants.${themeContext.name}.slider.hover.SliderThumbImageVertical`,
    )

    out[themeName] = node
  }

  return out
}
