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

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  styleOverrides: {
    root: {
      ...handleBreakpoints({ minHeight: IconSize.xxs }),
      borderRadius: 0,
      // Nesting required as otherwise it'll break in mobile for some reason
      '&': {
        paddingBlock: 0,
      },
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        // Enlarger the border by the thumb width so that the thumb 0% and 100% don't overlap with said border
        right: -THUMB_WIDTH / 2,
        left: -THUMB_WIDTH / 2,
        border: `1px solid ${design.Color.Neutral[500]}`,
        zIndex: -1,
      },
      // Paste a primary colored rectangle on the left side of the enlargened border
      '&::before': {
        content: '""',
        position: 'absolute',
        left: -THUMB_WIDTH / 2,
        width: THUMB_WIDTH / 2,
        height: '100%',
        backgroundColor: design.Button.Primary.Default.Fill,
        zIndex: 0,
      },
      '&.Mui-disabled::before': {
        // Copy mui's slider disabled color
        backgroundColor: 'var(--mui-palette-grey-400)',
      },
    },

    // Can't use trackAndThumbHeights here, need a different CSS selector for 'large' adjustments
    sizeLarge: handleBreakpoints({
      minHeight: IconSize.lg,
    }),

    track: {
      ...trackAndThumbHeights,
    },

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

    rail: { height: 0 },
  },
})
