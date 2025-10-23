/// <reference types="./mui-slider.d.ts" />
import { sliderClasses } from '@mui/material/Slider'
import type { SliderProps } from '@mui/material/Slider'
import type { Components } from '@mui/material/styles'
import { handleBreakpoints, type Responsive } from '@ui-kit/themes/basic-theme'
import { type DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const {
  Slider: { Height: SliderHeight, ThumbWidth: SliderThumbWidth },
} = SizesAndSpaces

type SliderSize = NonNullable<SliderProps['size']>

type SliderSizeDefinition = {
  height: Responsive
  thumbWidth: Responsive
}

export const SLIDER_RAIL_GRADIENT_STOPS_VAR = '--slider-rail-gradient-stops'

/**
 * CSS custom property name for customizing the slider background color.
 * Used to set a background color for the slider rail.
 */
const SLIDER_BACKGROUND_VAR = '--slider-background'
const SLIDER_HEIGHT_VAR = '--slider-height'
const SLIDER_THUMB_WIDTH_VAR = '--slider-thumb-width'

// Shared selector for single-thumb sliders
const singleThumbSelector = ':not(:has([data-index="1"]))'

const sliderSizes: Record<SliderSize, SliderSizeDefinition> = {
  small: {
    height: SliderHeight.small,
    thumbWidth: SliderThumbWidth.small,
  },
  medium: {
    height: SliderHeight.medium,
    thumbWidth: SliderThumbWidth.medium,
  },
}

const defaultSliderSize = sliderSizes.small

/**
 * Creates a pseudo-element style object for slider right extension
 *
 * This function generates styles for a pseudo-element that creates a border around the slider
 * and extends beyond the slider's right and left edge by half the thumb width to prevent
 * the thumb from overlapping with the border when at 100% position.
 *
 * Also provides a background fill area that can be customized via CSS custom properties.
 *
 * @param design - The design system containing color definitions
 * @param isHorizontal - Whether the slider is horizontal or vertical
 * @param borderColor - The color of the border
 * @returns CSS style object for the right extension pseudo-element
 */
const SliderExtension = (design: DesignSystem, isHorizontal: boolean, borderColor?: string) => ({
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    ...(isHorizontal
      ? { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }
      : { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }),
    ...(isHorizontal
      ? { right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }
      : { top: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }),
    border: borderColor ? `1px solid ${borderColor}` : 'none',
    backgroundColor: `var(${SLIDER_BACKGROUND_VAR})`,
    zIndex: 0,
  },
})

const borderedRailBackground = (design: DesignSystem, direction: 'to right' | 'to top') => {
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

type GradientStopsDefinition = Readonly<Record<number | `${number}`, string>>

const createGradientStopsString = (stops: GradientStopsDefinition) => {
  const entries = Object.entries(stops).map(([percent, color]) => ({
    percent: Number(percent),
    color,
  }))

  entries.sort((a, b) => a.percent - b.percent)

  let previous = 0
  const parts: string[] = []
  for (const { percent, color } of entries) {
    parts.push(`${color} ${previous}%`, `${color} ${percent}%`)
    previous = percent
  }

  return parts.join(', ')
}

const orientationToDirection = (orientation: SliderProps['orientation']): 'to right' | 'to top' =>
  orientation === 'vertical' ? 'to top' : 'to right'

const getGradientStopsForBackground = (
  design: DesignSystem,
  railBackground: SliderProps['railBackground'],
  disabled?: boolean,
): string | undefined => {
  if (disabled && railBackground !== 'default' && railBackground !== undefined) {
    return createGradientStopsString(design.Sliders.SliderBackground.Disabled)
  }
  if (railBackground === 'safe') {
    return createGradientStopsString(design.Sliders.SliderBackground.Safe)
  }
  if (railBackground === 'danger') {
    return createGradientStopsString(design.Sliders.SliderBackground.Danger)
  }
  return undefined
}

const baseRootStyle = (design: DesignSystem, isHorizontal: boolean): Record<string, any> => ({
  ...handleBreakpoints({
    [SLIDER_HEIGHT_VAR]: defaultSliderSize.height,
    [SLIDER_THUMB_WIDTH_VAR]: defaultSliderSize.thumbWidth,
  }),
  height: isHorizontal ? `var(${SLIDER_HEIGHT_VAR})` : `calc(100% - var(${SLIDER_HEIGHT_VAR}) )`,
  width: isHorizontal ? `calc(100% - var(${SLIDER_HEIGHT_VAR}))` : `var(${SLIDER_HEIGHT_VAR})`,
  borderRadius: 0,
  border: 'none',
  // Nesting required as otherwise it'll break in mobile for some reason
  '&': { paddingBlock: 0 },
  position: 'relative',
  paddingInline: 0,
  paddingBlock: 0,
  // This is to compensate the ::before and ::after pseudo-elements needed for the thumb width. It dynamically adapts to the slider size.
  marginInline: isHorizontal ? `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)` : 0,
  marginBlock: isHorizontal ? 0 : `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
  '::after': {
    // Disable pointer events so it doesn't block "hover" detection on the thumb
    pointerEvents: 'none',
    border: 'none',
  },
})

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  defaultProps: {
    size: 'small',
    railBackground: 'default',
  },
  styleOverrides: {
    root: ({ ownerState }) => {
      const { orientation = 'horizontal', railBackground = 'default' } = ownerState
      const borderColor = railBackground === 'default' ? design.Color.Neutral[500] : undefined
      const isHorizontal = orientation === 'horizontal'

      return {
        ...baseRootStyle(design, isHorizontal),
        ...SliderExtension(design, isHorizontal, borderColor),
      }
    },

    thumb: ({ ownerState }) => {
      const { orientation = 'horizontal' } = ownerState
      const isHorizontal = orientation === 'horizontal'

      return {
        width: isHorizontal ? `var(${SLIDER_THUMB_WIDTH_VAR})` : `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)`,
        height: isHorizontal ? `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)` : `var(${SLIDER_THUMB_WIDTH_VAR})`,
        background: `${design.Layer.Highlight.Fill} url(${design.Sliders.SliderThumbImage}) center no-repeat`,
        transition: `background ${TransitionFunction}, border ${TransitionFunction}`,
        border: `1px solid ${design.Color.Neutral[25]}`,
        borderRadius: 0,
        zIndex: 1,

        '&:hover': {
          backdropFilter: 'invert(1)', // This won't work for background images
          // Instead, explicitly set an inverted background
          background: `${design.Color.Neutral[50]} url(${design.Sliders.SliderThumbImage}) center no-repeat`,
          backgroundBlendMode: 'difference', // This inverts colors in the background
          border: `1px solid ${design.Button.Primary.Default.Fill}`,
        },
        '&:hover, &.Mui-focusVisible': {
          boxShadow: 'none', // Remove default MUI focus ring
        },
        '&.Mui-disabled': {
          background: `${design.Color.Neutral[600]} url(${design.Sliders.SliderThumbImage}) center no-repeat`,
        },
      }
    },

    track: ({ ownerState }) => {
      const { orientation = 'horizontal' } = ownerState
      const isHorizontal = orientation === 'horizontal'
      return {
        ...(isHorizontal ? { height: `var(${SLIDER_HEIGHT_VAR})` } : { width: `var(${SLIDER_HEIGHT_VAR})` }),
        borderRadius: 0,
        border: 'none',
        /**
         * Creates a pseudo-element style object for slider continuity
         *
         * This styles add pseudo-element to the track
         * left side by half the thumb width and fills it with the primary button color
         * for single-thumb
         */
        '&::before': {
          content: '""',
          position: 'absolute',
          ...(isHorizontal
            ? { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }
            : { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }),
          width: isHorizontal ? `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)` : '100%',
          height: isHorizontal ? '100%' : `calc(var(${SLIDER_HEIGHT_VAR}) / 2)`,
        },
        // Only fill the left border gap if there's a single thumb
        [`.MuiSlider-root${singleThumbSelector} &::before`]: {
          backgroundColor: design.Color.Primary[500],
        },

        '.Mui-disabled &::before': {
          backgroundColor: 'currentColor',
        },
      }
    },

    rail: ({ ownerState }) => {
      const { orientation = 'horizontal', railBackground = 'default', disabled = false } = ownerState
      const direction = orientationToDirection(orientation)
      const gradientStops = getGradientStopsForBackground(design, railBackground, disabled)
      const isHorizontal = orientation === 'horizontal'

      return {
        backgroundColor: 'transparent',
        ...(isHorizontal
          ? { left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }
          : { top: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }),
        ...(isHorizontal
          ? { right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }
          : { bottom: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)` }),
        ...(isHorizontal
          ? { width: `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))` }
          : { height: `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))` }),
        pointerEvents: 'none',
        border: 'none',
        backgroundImage: 'none',
        opacity: 1,
        ...(railBackground === 'bordered' && borderedRailBackground(design, direction)),
        ...(gradientStops
          ? {
              backgroundImage: `linear-gradient(${direction}, var(${SLIDER_RAIL_GRADIENT_STOPS_VAR}, ${gradientStops}))`,
              opacity: 1,
            }
          : null),
      }
    },
  },
  variants: Object.entries(sliderSizes).map(([size, { height, thumbWidth }]) => ({
    props: { size: size as SliderSize },
    style: handleBreakpoints({
      [SLIDER_HEIGHT_VAR]: height,
      [SLIDER_THUMB_WIDTH_VAR]: thumbWidth,
    }),
  })),
})
