/// <reference types="./mui-slider.d.ts" />
import { sliderClasses } from '@mui/material/Slider'
import type { Components } from '@mui/material/styles'
import { handleBreakpoints, type Responsive } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const {
  Slider: { Height: SliderHeight, ThumbWidth: SliderThumbWidth },
} = SizesAndSpaces

type SliderSize = 'small' | 'medium' | 'large'

type SliderSizeDefinition = {
  height: Responsive
  thumbWidth: Responsive
}

export const SLIDER_RAIL_GRADIENT_STOPS_VAR = '--slider-rail-gradient-stops'
export const SLIDER_RAIL_BACKGROUND_CLASSES = {
  bordered: 'CurveSlider-railBackgroundBordered',
  safe: 'CurveSlider-railBackgroundSafe',
  danger: 'CurveSlider-railBackgroundDanger',
} as const

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
  large: {
    height: SliderHeight.large,
    thumbWidth: SliderThumbWidth.large,
  },
}

const defaultSliderSize = sliderSizes.small

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
    right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
    left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
    border: `1px solid ${design.Color.Neutral[500]}`,
    backgroundColor: `var(${SLIDER_BACKGROUND_VAR})`,
  },
})

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
    left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
    width: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
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

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => {
  const borderedSelector = `&.${SLIDER_RAIL_BACKGROUND_CLASSES.bordered}`

  const rootStyle: Record<string, any> = {
    ...handleBreakpoints({
      [SLIDER_HEIGHT_VAR]: defaultSliderSize.height,
      [SLIDER_THUMB_WIDTH_VAR]: defaultSliderSize.thumbWidth,
    }),
    height: `var(${SLIDER_HEIGHT_VAR})`,
    borderRadius: 0,
    border: 'none',
    // Nesting required as otherwise it'll break in mobile for some reason
    '&': { paddingBlock: 0 },
    position: 'relative',
    paddingInline: 0,
    // This is to compensate the ::before and ::after pseudo-elements needed for the thumb width. It dynamically adapts to the slider size.
    marginInline: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
    ...rightExtension(design),
    ...leftExtension(design),
    [`&.${sliderClasses.vertical}`]: {
      height: '100%',
      width: `var(${SLIDER_HEIGHT_VAR})`,
      paddingBlock: 0,
      paddingInline: 0,
    },
    [`${borderedSelector}:not(.${sliderClasses.vertical}) .${sliderClasses.rail}`]: borderedRailBackground(
      design,
      'to right',
    ),
    [`${borderedSelector}.${sliderClasses.vertical} .${sliderClasses.rail}`]: borderedRailBackground(design, 'to top'),
    '::after': {
      // Disable pointer events so it doesn't block "hover" detection on the thumb
      pointerEvents: 'none',
      border: 'none',
    },
  }

  const gradientDefinitions: Array<[string, GradientStopsDefinition]> = [
    [SLIDER_RAIL_BACKGROUND_CLASSES.safe, design.Sliders.SliderBackground.Safe],
    [SLIDER_RAIL_BACKGROUND_CLASSES.danger, design.Sliders.SliderBackground.Danger],
  ]

  for (const [className, stops] of gradientDefinitions) {
    const stopsString = createGradientStopsString(stops)
    const gradientStopsVar = `var(${SLIDER_RAIL_GRADIENT_STOPS_VAR}, ${stopsString})`

    rootStyle[`&.${className}`] = {
      [SLIDER_RAIL_GRADIENT_STOPS_VAR]: stopsString,
    }
    rootStyle[`&.${className}:not(.${sliderClasses.vertical}) .${sliderClasses.rail}`] = {
      backgroundImage: `linear-gradient(to right, ${gradientStopsVar})`,
      opacity: 1,
      border: 0,
    }
    rootStyle[`&.${className}.${sliderClasses.vertical} .${sliderClasses.rail}`] = {
      backgroundImage: `linear-gradient(to top, ${gradientStopsVar})`,
      opacity: 1,
      border: 0,
    }
  }

  return {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: rootStyle,

      thumb: {
        width: `var(${SLIDER_THUMB_WIDTH_VAR})`,
        background: `${design.Layer.Highlight.Fill} url(${design.Sliders.SliderThumbImage}) center no-repeat`,
        transition: `background ${TransitionFunction}, border ${TransitionFunction}`,
        border: `1px solid ${design.Color.Neutral[25]}`,
        borderRadius: 0,
        // 2px for the border to be outside the rail
        height: `calc(var(${SLIDER_HEIGHT_VAR}) + 2px)`,

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
        height: `var(${SLIDER_HEIGHT_VAR})`,
        borderRadius: 0,
        border: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
          width: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / 2)`,
          height: '100%',
          backgroundColor: design.Color.Primary[500],
        },
        '.Mui-disabled &::before': {
          backgroundColor: 'currentColor',
        },
      },
      rail: {
        backgroundColor: 'transparent',
        left: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
        right: `calc(var(${SLIDER_THUMB_WIDTH_VAR}) / -2)`,
        width: `calc(100% + var(${SLIDER_THUMB_WIDTH_VAR}))`,
        pointerEvents: 'none',
        border: `1px solid ${design.Color.Neutral[500]}`,
        opacity: 1,
      },
    },
    variants: Object.entries(sliderSizes).map(([size, { height, thumbWidth }]) => ({
      props: { size: size as SliderSize },
      style: handleBreakpoints({
        [SLIDER_HEIGHT_VAR]: height,
        [SLIDER_THUMB_WIDTH_VAR]: thumbWidth,
      }),
    })),
  }
}
