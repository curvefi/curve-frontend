import type { Components } from '@mui/material/styles'
import { handleBreakpoints, type Responsive } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Sizing } = SizesAndSpaces

const THUMB_WIDTH = 20 // 20px is a default MUI value, not responsive to reduce headaches
export const CLASS_BORDERLESS = 'borderless'

/**
 * CSS custom property name for customizing the slider background color.
 * Used by components like TradingSlider to set a background color.
 * This approach is necessary because we can't add TSX props directly.
 */
export const SLIDER_BACKGROUND_VAR = '--slider-background'

type Size = 'small' | 'medium'
const heights: Record<Size, Responsive> = {
  small: Sizing.xs,
  medium: Sizing.sm,
}

// Equalizes track and thumb height with support for responsiveness
const trackAndThumbHeights = {
  ...handleBreakpoints({ height: heights['small'] }),

  '&.MuiSlider-sizeMedium, .MuiSlider-sizeMedium &': handleBreakpoints({ height: heights['medium'] }),
}

/**
 * Creates a pseudo-element style object for slider right extension
 *
 * This function generates styles for a pseudo-element that creates a border around the slider
 * and extends beyond the slider's right edge by half the thumb width to prevent
 * the thumb from overlapping with the border when at 100% position.
 *
 * Also provides a background fill area that can be customized via CSS custom properties.
 *
 * @param design - The design system containing color definitions
 * @returns CSS style object for the right extension pseudo-element
 */
const rightExtension = (design: DesignSystem) => ({
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    right: -THUMB_WIDTH / 2,
    left: -THUMB_WIDTH / 2,
    border: `1px solid ${design.Color.Neutral[500]}`,
    backgroundColor: `var(${SLIDER_BACKGROUND_VAR})`,
  },
})

// Shared selector for single-thumb sliders
const singleThumbSelector = ':not(:has([data-index="1"]))'

/**
 * Creates a pseudo-element style object for slider left extension
 *
 * This function generates styles for a pseudo-element that extends the slider's
 * left side by half the thumb width and fills it with the primary button color
 * for single-thumb sliders. This creates visual continuity between the track
 * and the extended border area.
 *
 * When the slider is disabled, it uses the standard MUI disabled color to match
 * the disabled track appearance.
 *
 * @param design - The design system containing color definitions
 * @returns CSS style object for the left extension pseudo-element
 */
const leftExtension = (design: DesignSystem) => ({
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -THUMB_WIDTH / 2,
    width: THUMB_WIDTH / 2,
    height: '100%',
  },
  // Only fill the left border gap if there's a single thumb
  [`&${singleThumbSelector}::before`]: {
    backgroundColor: design.Color.Primary[500],
  },
  // Increase specificity so disabled wins over default when both apply
  [`&&.Mui-disabled${singleThumbSelector}::before`]: {
    backgroundColor: 'var(--mui-palette-grey-400)',
  },
})

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  defaultProps: {
    size: 'small',
  },
  styleOverrides: {
    root: {
      ...trackAndThumbHeights,
      borderRadius: 0,
      border: 'none',
      // Nesting required as otherwise it'll break in mobile for some reason
      '&': { paddingBlock: 0 },
      position: 'relative',
      paddingInline: 0,
      ...rightExtension(design),
      ...leftExtension(design),
      [`&.${CLASS_BORDERLESS}::after`]: {
        border: 0,
      },
      '::after': {
        // Disable pointer events so it doesn't block "hover" detection on the thumb
        pointerEvents: 'none',
        border: 'none',
      },
    },

    thumb: {
      width: THUMB_WIDTH,
      background: `${design.Layer.Highlight.Fill} url(${design.Sliders.SliderThumbImage}) center no-repeat`,
      transition: `background ${TransitionFunction}, border ${TransitionFunction}`,
      border: `1px solid ${design.Color.Neutral[25]}`,
      borderRadius: 0,
      // 2px for the border to be outside the rail
      height: `calc(100% + 2px)`,

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
    },

    track: {
      ...trackAndThumbHeights,
      borderRadius: 0,
      border: 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: -THUMB_WIDTH / 2,
        width: THUMB_WIDTH / 2,
        height: '100%',
        backgroundColor: design.Color.Primary[500],
      },
      '.Mui-disabled &::before': {
        backgroundColor: 'currentColor',
      },
    },
    rail: {
      backgroundColor: 'transparent',
      left: -THUMB_WIDTH / 2,
      right: -THUMB_WIDTH / 2,
      width: `calc(100% + ${THUMB_WIDTH}px)`,
      pointerEvents: 'none',
    },
  },
})
