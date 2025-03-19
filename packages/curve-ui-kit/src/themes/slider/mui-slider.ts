import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const THUMB_WIDTH = 20 // 20px is a default MUI value, not responsive to reduce headaches

// Equalizes track and thumb height with support for responsiveness
const trackAndThumbHeights = {
  ...handleBreakpoints({ height: IconSize.xxs }),
  borderRadius: 0,
  border: 'none',

  '.MuiSlider-sizeLarge &': {
    ...handleBreakpoints({ height: IconSize.lg }),
  },
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
    backgroundColor: design.Button.Primary.Default.Fill,
  },
  '&.Mui-disabled::before': {
    backgroundColor: 'var(--mui-palette-grey-400)',
  },
})

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  styleOverrides: {
    root: {
      ...handleBreakpoints({ minHeight: IconSize.xxs }),
      borderRadius: 0,
      // Nesting required as otherwise it'll break in mobile for some reason
      '&': { paddingBlock: 0 },
      position: 'relative',
      ...borderPseudoElement(design),
      ...borderLeftFillPseudoElement(design),
    },

    // Can't use trackAndThumbHeights here, need a different CSS selector for 'large' adjustments
    sizeLarge: handleBreakpoints({
      minHeight: IconSize.lg,
    }),

    thumb: {
      ...trackAndThumbHeights,
      width: THUMB_WIDTH,
      background: `${design.Color.Neutral[950]} url(${design.Inputs.SliderThumbImage}) center no-repeat`,
      transition: `filter ${TransitionFunction}`,
      '&:hover': {
        filter: 'invert(1)',
      },
      '&:hover, &.Mui-focusVisible': {
        boxShadow: 'none', // Remove default MUI focus ring
      },
    },

    track: { ...trackAndThumbHeights },
    rail: { height: 0 },
  },
})
