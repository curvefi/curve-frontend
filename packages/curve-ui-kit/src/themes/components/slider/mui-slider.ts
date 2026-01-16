/// <reference types="./mui-slider.d.ts" />
import type { SliderProps } from '@mui/material/Slider'
import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { type DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SliderSize } from './types'
import {
  borderedRailBackground,
  orientationToDirection,
  getOrientationConfig,
  singleThumbSelector,
  SLIDER_BACKGROUND_VAR,
  SLIDER_HEIGHT_VAR,
  SLIDER_THUMB_WIDTH_VAR,
  sliderSizes,
  SLIDER_RAIL_GRADIENT_STOPS_VAR,
  getGradientStopsForBackground,
  DEFAULT_SLIDER_SIZE,
} from './utils'
/**
 * Generates styles for a pseudo-element that creates a border around the slider
 * and extends beyond the slider's right and left edge by half the thumb width to prevent
 * the thumb from overlapping with the border when at 100% position.
 */
const SliderExtension = (orientation: SliderProps['orientation'], borderColor: string | undefined) => {
  const {
    extensionOffsets: { start, end },
  } = getOrientationConfig(orientation)

  return {
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      ...start,
      ...end,
      border: borderColor ? `1px solid ${borderColor}` : 'none',
      backgroundColor: `var(${SLIDER_BACKGROUND_VAR})`,
      zIndex: 0,
      // Disable pointer events so it doesn't block "hover" detection on the thumb
      pointerEvents: 'none',
    },
  }
}

const baseRootStyle = (orientation: SliderProps['orientation']): Record<string, unknown> => {
  const {
    root: { size, margins },
  } = getOrientationConfig(orientation)

  return {
    ...handleBreakpoints({
      [SLIDER_HEIGHT_VAR]: DEFAULT_SLIDER_SIZE.height,
      [SLIDER_THUMB_WIDTH_VAR]: DEFAULT_SLIDER_SIZE.thumbWidth,
    }),
    // remove the slider thumb's width from the vertical orientation to prevent overflows
    height: size.height,
    width: size.width,
    borderRadius: 0,
    border: 'none',
    // Nesting required as otherwise it'll break in mobile for some reason
    '&': { paddingBlock: 0 },
    position: 'relative',
    paddingInline: 0,
    // This is to compensate the ::before and ::after pseudo-elements needed for the thumb width. It dynamically adapts to the slider size.
    marginInline: margins.marginInline,
    marginBlock: margins.marginBlock,
  }
}

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  defaultProps: {
    size: 'small',
    'data-rail-background': 'default',
  },
  styleOverrides: {
    root: ({ ownerState }) => {
      const { orientation = 'horizontal', 'data-rail-background': railBackground = 'default' } = ownerState
      const borderColor = railBackground === 'default' ? design.Color.Neutral[500] : undefined

      return {
        ...baseRootStyle(orientation),
        ...SliderExtension(orientation, borderColor),
      }
    },

    thumb: ({ ownerState }) => {
      const { orientation = 'horizontal' } = ownerState
      const {
        thumb: { size, getImages },
      } = getOrientationConfig(orientation)
      const { default: sliderThumbImage, hover: sliderThumbImageHover } = getImages(design)
      const activeThumbStyles = {
        backdropFilter: 'invert(1)', // This won't work for background images
        // Instead, explicitly set an inverted background
        background: `${design.Color.Neutral[50]} url(${sliderThumbImageHover}) center no-repeat`,
        backgroundBlendMode: 'difference', // This inverts colors in the background
        border: `1px solid ${design.Button.Primary.Default.Fill}`,
        boxShadow: 'none' as const,
      }

      return {
        // Add 2px to the thumb width and height to compensate the border
        width: size.width,
        height: size.height,
        background: `${design.Layer.Highlight.Fill} url(${sliderThumbImage}) center no-repeat`,
        transition: `background ${TransitionFunction}, border ${TransitionFunction}`,
        border: `1px solid ${design.Color.Neutral[25]}`,
        borderRadius: 0,
        zIndex: 1,
        '&.Mui-active': activeThumbStyles,
        '&.Mui-focusVisible': {
          boxShadow: 'none',
        },
        // only target precise hover (not fingerprinting touch events) to prevent parasitic active thumb after touch events
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': activeThumbStyles,
        },
        '&.Mui-disabled': {
          background: `${design.Color.Neutral[600]} url(${sliderThumbImage}) center no-repeat`,
        },
        '&::after': {
          width: size.width,
          height: size.height,
        },
      }
    },

    track: ({ ownerState }) => {
      const { orientation = 'horizontal' } = ownerState
      const {
        track: { size, beforePosition, beforeSize },
      } = getOrientationConfig(orientation)
      return {
        ...size,
        borderRadius: 0,
        border: 'none',
        /**
         * Add pseudo-element to the track left side by half the thumb width and
         * fills it with the primary button color for single-thumb
         */
        '&::before': {
          content: '""',
          position: 'absolute',
          ...beforePosition,
          ...beforeSize,
        },
        // Only fill the left border gap if there's a single thumb
        [`.MuiSlider-root${singleThumbSelector} &::before`]: {
          backgroundColor: design.Color.Primary[500],
        },

        '.Mui-disabled &&::before': {
          backgroundColor: 'currentColor',
        },
      }
    },

    rail: ({ ownerState }) => {
      const {
        orientation = 'horizontal',
        'data-rail-background': railBackground = 'default',
        disabled = false,
      } = ownerState
      const direction = orientationToDirection(orientation)
      const gradientStops = getGradientStopsForBackground(design, railBackground, disabled)
      const {
        rail: { startOffset, endOffset, size },
      } = getOrientationConfig(orientation)

      return {
        backgroundColor: 'transparent',
        ...startOffset,
        ...endOffset,
        ...size,
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
