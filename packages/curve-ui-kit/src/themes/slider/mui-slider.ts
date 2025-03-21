import type { Components } from '@mui/material/styles'
import { handleBreakpoints, type Responsive } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Sizing } = SizesAndSpaces

const THUMB_WIDTH = 20 // 20px is a default MUI value, not responsive to reduce headaches

type Size = 'small' | 'medium'
const heights: Record<Size, Responsive> = {
  small: Sizing.xs,
  medium: Sizing.sm,
}

// Equalizes track and thumb height with support for responsiveness
const trackAndThumbHeights = {
  ...handleBreakpoints({ height: heights['small'] }),
  borderRadius: 0,
  border: 'none',

  '&.MuiSlider-sizeMedium, .MuiSlider-sizeMedium &': handleBreakpoints({ height: heights['medium'] }),
}

/**
 * Creates a pseudo-element style object for slider border
 *
 * This function generates styles for a pseudo-element that creates a border around the slider.
 * The border is extended beyond the slider's edges by half the thumb width to prevent
 * the thumb from overlapping with the border when at 0% or 100% positions.
 *
 * The negative z-index ensures the border appears behind the slider components.
 *
 * @param design - The design system containing color definitions
 * @returns CSS style object for the border pseudo-element
 */
const borderPseudoElement = (design: DesignSystem) => ({
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    right: -THUMB_WIDTH / 2,
    left: -THUMB_WIDTH / 2,
    border: `1px solid ${design.Color.Neutral[500]}`,
    zIndex: -1,
  },
})

// Shared selector for single-thumb sliders
const singleThumbSelector = ':not(:has([data-index="1"]))'

/**
 * Creates a pseudo-element style object for the left fill of the slider
 *
 * This function generates styles for a pseudo-element that fills the extended
 * left side of the slider with the primary button color. This creates a visual
 * continuity between the track and the extended border area.
 *
 * When the slider is disabled, it uses the standard MUI disabled color to match
 * the disabled track appearance.
 *
 * @param design - The design system containing color definitions
 * @returns CSS style object for the left fill pseudo-element
 */
const borderLeftFillPseudoElement = (design: DesignSystem) => ({
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -THUMB_WIDTH / 2,
    width: THUMB_WIDTH / 2,
    height: '100%',
  },
  // Only fill the left border gap if there's a single thumb
  [`&${singleThumbSelector}::before`]: {
    backgroundColor: design.Button.Primary.Default.Fill,
  },
  [`&.Mui-disabled${singleThumbSelector}::before`]: {
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
      // Nesting required as otherwise it'll break in mobile for some reason
      '&': { paddingBlock: 0 },
      position: 'relative',
      ...borderPseudoElement(design),
      ...borderLeftFillPseudoElement(design),
    },

    thumb: {
      ...trackAndThumbHeights,
      width: THUMB_WIDTH,
      background: `${design.Color.Neutral[950]} url(${design.Inputs.SliderThumbImage}) center no-repeat`,
      transition: `background ${TransitionFunction}, border ${TransitionFunction}`,
      '&:hover': {
        backdropFilter: 'invert(1)', // This won't work for background images
        // Instead, explicitly set an inverted background
        background: `${design.Color.Neutral[50]} url(${design.Inputs.SliderThumbImage}) center no-repeat`,
        backgroundBlendMode: 'difference', // This inverts colors in the background
        border: `1px solid ${design.Color.Primary[500]}`,
      },
      '&:hover, &.Mui-focusVisible': {
        boxShadow: 'none', // Remove default MUI focus ring
      },
      '&.Mui-disabled': {
        background: `${design.Color.Neutral[600]} url(${design.Inputs.SliderThumbImage}) center no-repeat`,
      },
    },

    track: trackAndThumbHeights,
    rail: { height: 0 },
  },
})
