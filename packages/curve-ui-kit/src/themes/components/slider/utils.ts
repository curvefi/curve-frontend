import { sortBy } from 'lodash'
import { SliderProps } from '@mui/material/Slider'
import { DesignSystem } from '@ui-kit/themes/design'
import { Blues, Violet } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type {
  GradientStopsDefinition,
  OrientationConfig,
  SliderSize,
  SliderSizeDefinition,
  SliderRailBackground,
} from './types'

const {
  Slider: { Height: SliderHeight, ThumbWidth: SliderThumbWidth },
} = SizesAndSpaces

export const sliderSizes: Record<SliderSize, SliderSizeDefinition> = {
  small: {
    height: SliderHeight.small,
    thumbWidth: SliderThumbWidth.small,
  },
  medium: {
    height: SliderHeight.medium,
    thumbWidth: SliderThumbWidth.medium,
  },
}

export const DEFAULT_SLIDER_SIZE = sliderSizes.small
export const DEFAULT_ORIENTATION: NonNullable<SliderProps['orientation']> = 'horizontal'
export const SLIDER_RAIL_GRADIENT_STOPS_VAR = '--slider-rail-gradient-stops'
/**
 * CSS custom property name for customizing the slider background color.
 * Used to set a background color for the slider rail.
 */
export const SLIDER_BACKGROUND_VAR = '--slider-background'

// Shared selector for single-thumb sliders. Only thumbs have [data-index="n"] attribute
export const singleThumbSelector = ':not(:has([data-index="1"]))'

export const SLIDER_HEIGHT_VAR = '--slider-height'
export const SLIDER_THUMB_WIDTH_VAR = '--slider-thumb-width'

const orientationConfigMap: Record<string, OrientationConfig> = {
  horizontal: {
    gradientDirection: 'to right',
    extensionOffsets: {
      start: { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      end: { right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
    },
    root: {
      size: {
        height: `var(${SLIDER_HEIGHT_VAR})`,
        width: '100%',
      },
      margins: {
        marginInline: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
        marginBlock: 0,
      },
    },
    thumb: {
      size: {
        width: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) + 2px)`,
        height: `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)`,
      },
      getImage: (design) => design.Sliders.SliderThumbImage,
    },
    track: {
      size: { height: `var(${SLIDER_HEIGHT_VAR})` },
      beforePosition: { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      beforeSize: {
        width: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
        height: '100%',
      },
    },
    rail: {
      startOffset: { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      endOffset: { right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      size: { width: `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))` },
    },
  },
  vertical: {
    gradientDirection: 'to top',
    extensionOffsets: {
      start: { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      end: { top: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
    },
    root: {
      size: {
        height: `calc(100% - var(${SLIDER_THUMB_WIDTH_VAR}))`,
        width: `var(${SLIDER_HEIGHT_VAR})`,
      },
      margins: {
        marginInline: 0,
        marginBlock: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
      },
    },
    thumb: {
      size: {
        width: `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)`,
        height: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) + 2px)`,
      },
      getImage: (design) => design.Sliders.SliderThumbImageVertical,
    },
    track: {
      size: { width: `var(${SLIDER_HEIGHT_VAR})` },
      beforePosition: { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      beforeSize: {
        width: '100%',
        height: `calc(var(${SLIDER_HEIGHT_VAR}) / 2)`,
      },
    },
    rail: {
      startOffset: { top: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      endOffset: { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` },
      size: { height: `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))` },
    },
  },
}

export const getOrientationConfig = (orientation?: SliderProps['orientation']): OrientationConfig => {
  const key = orientation ?? DEFAULT_ORIENTATION
  return orientationConfigMap[key] ?? orientationConfigMap[DEFAULT_ORIENTATION]
}

export const borderedRailBackground = (design: DesignSystem, direction: 'to right' | 'to top') => {
  const segment = design.Color.Primary[200]
  const line = design.Color.Neutral[500]
  const segments = `linear-gradient(${direction}, ${segment} 0%, ${segment} 25%, ${segment} 25%, ${segment} 50%, ${segment} 50%, ${segment} 75%, ${segment} 75%, ${segment} 100%)`
  const borders = `repeating-linear-gradient(${direction}, transparent 0, transparent calc(25% - 1px), ${line} calc(25% - 1px), ${line} 25%)`
  return {
    backgroundImage: `${borders}, ${segments}`,
    opacity: 1,
    border: 0,
  }
}

export const getGradientStopsForBackground = (
  design: DesignSystem,
  railBackground: SliderProps['data-rail-background'] = 'default',
  disabled?: boolean,
): string | undefined => {
  const gradientStops: Record<SliderRailBackground | 'disabled', string | undefined> = {
    default: undefined,
    bordered: undefined,
    disabled: createGradientStopsString(design.Sliders.SliderBackground.Disabled),
    safe: createGradientStopsString(design.Sliders.SliderBackground.Safe),
    danger: createGradientStopsString(design.Sliders.SliderBackground.Danger),
  }

  const resolvedBackground: SliderRailBackground = railBackground ?? 'default'
  const backgroundKey: SliderRailBackground | 'disabled' =
    disabled && resolvedBackground !== 'default' ? 'disabled' : resolvedBackground

  return gradientStops[backgroundKey]
}

export const createGradientStopsString = (stops: GradientStopsDefinition) =>
  sortBy(Object.entries(stops), ([percent]) => +percent)
    .map(([percent, color], index, entries) => `${color} ${entries[index - 1]?.[0] ?? 0}%, ${color} ${percent}%`)
    .join(', ')

export const orientationToDirection = (orientation: SliderProps['orientation']): 'to right' | 'to top' =>
  getOrientationConfig(orientation).gradientDirection

// TODO: temporary fix for the "Layers.Highlight.Fill" color difference between codebase and Design
export const thumbColorsMap: Record<DesignSystem['theme'], string> = {
  light: Blues[500],
  dark: Blues[50],
  chad: Violet[700],
}
