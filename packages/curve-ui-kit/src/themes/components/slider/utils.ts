import { sortBy } from 'lodash'
import { SliderProps } from '@mui/material/Slider'
import { DesignSystem } from '@ui-kit/themes/design'
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
/**
 * Number of sections to divide the bordered slider rail into.
 * Borders will be placed between sections.
 */
export const BORDERED_SECTION_COUNT = 4

// Shared selector for single-thumb sliders. Only thumbs have [data-index="n"] attribute
export const singleThumbSelector = ':not(:has([data-index="1"]))'

export const SLIDER_HEIGHT_VAR = '--slider-height'
export const SLIDER_THUMB_WIDTH_VAR = '--slider-thumb-width'

const SLIDER_THUMB_WIDTH_HALF_NEG = `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`
const SLIDER_THUMB_WIDTH_HALF_POS = `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`
const SLIDER_THUMB_WIDTH_PLUS_BORDERS = `calc(var(${SLIDER_THUMB_WIDTH_VAR}) + 2px)`
const SLIDER_HEIGHT_PLUS_BORDERS = `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)`
const SLIDER_FULL_WIDTH_PLUS_THUMB_WIDTH = `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))`

const orientationConfigMap: Record<string, OrientationConfig> = {
  horizontal: {
    gradientDirection: 'to right',
    extensionOffsets: {
      start: { left: SLIDER_THUMB_WIDTH_HALF_NEG },
      end: { right: SLIDER_THUMB_WIDTH_HALF_NEG },
    },
    root: {
      size: {
        height: `var(${SLIDER_HEIGHT_VAR})`,
        width: '100%',
      },
      margins: {
        marginInline: SLIDER_THUMB_WIDTH_HALF_POS,
        marginBlock: 0,
      },
    },
    thumb: {
      size: {
        width: SLIDER_THUMB_WIDTH_PLUS_BORDERS,
        height: SLIDER_HEIGHT_PLUS_BORDERS,
      },
      getImages: (design) => ({
        default: design.Sliders.default.SliderThumbImage,
        hover: design.Sliders.hover.SliderThumbImage,
      }),
    },
    track: {
      size: { height: `var(${SLIDER_HEIGHT_VAR})` },
      beforePosition: { left: SLIDER_THUMB_WIDTH_HALF_NEG },
      beforeSize: {
        width: SLIDER_THUMB_WIDTH_HALF_POS,
        height: '100%',
      },
    },
    rail: {
      startOffset: { left: SLIDER_THUMB_WIDTH_HALF_NEG },
      endOffset: { right: SLIDER_THUMB_WIDTH_HALF_NEG },
      size: { width: SLIDER_FULL_WIDTH_PLUS_THUMB_WIDTH },
    },
  },
  vertical: {
    gradientDirection: 'to top',
    extensionOffsets: {
      start: { bottom: SLIDER_THUMB_WIDTH_HALF_NEG },
      end: { top: SLIDER_THUMB_WIDTH_HALF_NEG },
    },
    root: {
      size: {
        height: `calc(100% - var(${SLIDER_THUMB_WIDTH_VAR}))`,
        width: `var(${SLIDER_HEIGHT_VAR})`,
      },
      margins: {
        marginInline: 0,
        marginBlock: SLIDER_THUMB_WIDTH_HALF_POS,
      },
    },
    thumb: {
      size: {
        width: SLIDER_HEIGHT_PLUS_BORDERS,
        height: SLIDER_THUMB_WIDTH_PLUS_BORDERS,
      },
      getImages: (design) => ({
        default: design.Sliders.default.SliderThumbImageVertical,
        hover: design.Sliders.hover.SliderThumbImageVertical,
      }),
    },
    track: {
      size: { width: `var(${SLIDER_HEIGHT_VAR})` },
      beforePosition: { bottom: SLIDER_THUMB_WIDTH_HALF_NEG },
      beforeSize: {
        width: '100%',
        height: `calc(var(${SLIDER_HEIGHT_VAR}) / 2)`,
      },
    },
    rail: {
      startOffset: { top: SLIDER_THUMB_WIDTH_HALF_NEG },
      endOffset: { bottom: SLIDER_THUMB_WIDTH_HALF_NEG },
      size: { height: SLIDER_FULL_WIDTH_PLUS_THUMB_WIDTH },
    },
  },
}

export const getOrientationConfig = (orientation?: SliderProps['orientation']): OrientationConfig => {
  const key = orientation ?? DEFAULT_ORIENTATION
  return orientationConfigMap[key] ?? orientationConfigMap[DEFAULT_ORIENTATION]
}

export const borderedRailBackground = (
  design: DesignSystem,
  direction: 'to right' | 'to top',
  sectionCount: number = BORDERED_SECTION_COUNT,
) => {
  const segment = design.Color.Primary[200]
  const line = design.Color.Neutral[500]

  // Calculate the percentage for each section
  const sectionPercentage = 100 / sectionCount

  // Build the segments gradient stops dynamically
  const segmentStops = Array.from({ length: sectionCount }, (_, i) => {
    const start = i * sectionPercentage
    const end = (i + 1) * sectionPercentage
    return `${segment} ${start}%, ${segment} ${end}%`
  }).join(', ')

  const segments = `linear-gradient(${direction}, ${segmentStops})`

  // Build borders only between sections (not at the edges)
  // For N sections, we need N-1 borders at the boundaries between sections
  const borderGradients = Array.from({ length: sectionCount - 1 }, (_, i) => {
    const position = (i + 1) * sectionPercentage
    return `linear-gradient(${direction}, transparent 0%, transparent calc(${position}% - 0.5px), ${line} calc(${position}% - 0.5px), ${line} calc(${position}% + 0.5px), transparent calc(${position}% + 0.5px), transparent 100%)`
  }).join(', ')

  return {
    backgroundImage: `${borderGradients}, ${segments}`,
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
    filled: createGradientStopsString(design.Sliders.SliderBackground.Filled),
    disabled: createGradientStopsString(design.Sliders.SliderBackground.Disabled),
    safe: createGradientStopsString(design.Sliders.SliderBackground.Safe),
    danger: createGradientStopsString(design.Sliders.SliderBackground.Danger),
  }

  const resolvedBackground: SliderRailBackground = railBackground
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
