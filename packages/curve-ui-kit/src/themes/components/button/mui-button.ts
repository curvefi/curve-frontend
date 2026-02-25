/// <reference path="./mui-button.d.ts" />
import { Breakpoint } from '@mui/material'
import type { Components } from '@mui/material/styles'
import { recordEntries } from '@curvefi/primitives/objects.utils'
import { basicMuiTheme, type Responsive } from '../../basic-theme'
import { DesignSystem } from '../../design'
import { Sizing } from '../../design/0_primitives'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'
import { Fonts } from '../../fonts'
import { buttonColor } from './utils'
const { LineHeight, OutlineWidth, FontWeight, ButtonSize, FontSize } = SizesAndSpaces

const sizeBreakpoint = (
  height: string,
  fontSize: Responsive,
  fontWeight: number,
  lineHeight: Responsive,
  breakpoint: Breakpoint,
) => ({
  [basicMuiTheme.breakpoints.up(breakpoint)]: {
    height,
    fontSize: fontSize[breakpoint],
    fontWeight,
    lineHeight: lineHeight[breakpoint],
  },
})

type ButtonSize = {
  height: keyof typeof ButtonSize
  fontSize: keyof typeof FontSize
  fontWeight?: keyof typeof FontWeight
  lineHeight: keyof typeof LineHeight
}
const buttonSize = ({ height, fontSize, fontWeight = 'Bold', lineHeight }: ButtonSize) => ({
  ...sizeBreakpoint(ButtonSize[height], FontSize[fontSize], FontWeight[fontWeight], LineHeight[lineHeight], 'mobile'),
  ...sizeBreakpoint(ButtonSize[height], FontSize[fontSize], FontWeight[fontWeight], LineHeight[lineHeight], 'tablet'),
  ...sizeBreakpoint(ButtonSize[height], FontSize[fontSize], FontWeight[fontWeight], LineHeight[lineHeight], 'desktop'),
})

export const defineMuiButton = ({ Button, Text }: DesignSystem): Components['MuiButton'] => {
  const { Primary, Secondary, Success, Error, Outlined, Ghost, Navigation, Focus_Outline, Transition } = Button
  const colors = {
    primary: buttonColor(Primary),
    secondary: buttonColor(Secondary),
    success: buttonColor(Success),
    error: buttonColor(Error),
    outlined: buttonColor(Outlined),
    ghost: buttonColor(Ghost),
    navigation: buttonColor(Navigation),
  }
  return {
    variants: [
      ...recordEntries(colors).map(([color, style]) => ({ props: { color }, style })),
      {
        props: { variant: 'link' },
        style: {
          '&.MuiButton-link': {
            textTransform: 'none',
            padding: 0,
            height: Sizing[400],
          },
        },
      },
      {
        props: { variant: 'inline' },
        style: {
          '&.MuiButton-inline': {
            display: 'inline',
            verticalAlign: 'baseline',
            textTransform: 'none',
            padding: 0,
            border: 0,
            lineHeight: 1,
            height: `auto`,
            minWidth: 'unset',
            textAlign: 'start',
            justifyContent: 'start',
          },
        },
      },
      {
        props: { variant: 'inline', size: 'extraSmall' },
        style: {
          '&.MuiButton-loading': {
            backgroundColor: 'transparent', // The disabled background looks very weird in such a small button
            svg: { transform: 'scale(0.75)' }, // Scale down the loading indicator to fit better with the extraSmall text
          },
        },
      },
      {
        props: { variant: 'outlined' },
        style: {
          backgroundColor: 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: Outlined.Default.Outline,
          color: Outlined.Default.Label,
          '&:hover': {
            backgroundColor: 'transparent',
            borderColor: Outlined.Hover.Outline,
            color: Outlined.Hover.Label,
          },
          '&:disabled': Outlined.Disabled && {
            backgroundColor: 'transparent',
            borderColor: Outlined.Disabled.Outline,
            color: Outlined.Disabled.Label,
          },
        },
      },
    ],
    styleOverrides: {
      root: {
        borderRadius: 0,
        border: `${OutlineWidth} solid transparent`,
        boxSizing: 'border-box',
        '&:focus-visible': { borderColor: Focus_Outline },
        fontFamily: Fonts[Text.FontFamily.Button],
        textTransform: 'uppercase',
        transition: Transition,
      },
      sizeExtraSmall: { ...buttonSize({ height: 'xs', fontSize: 'sm', lineHeight: 'md' }), textTransform: 'none' },
      sizeSmall: buttonSize({ height: 'sm', fontSize: 'sm', lineHeight: 'md' }),
      sizeMedium: buttonSize({ height: 'md', fontSize: 'md', lineHeight: 'xl' }),
      sizeLarge: buttonSize({ height: 'lg', fontSize: 'md', lineHeight: 'xl' }),
      startIcon: {
        [basicMuiTheme.breakpoints.up('mobile')]: { marginInlineEnd: SizesAndSpaces.Spacing.xs.mobile },
        [basicMuiTheme.breakpoints.up('tablet')]: { marginInlineEnd: SizesAndSpaces.Spacing.xs.tablet },
        [basicMuiTheme.breakpoints.up('desktop')]: { marginInlineEnd: SizesAndSpaces.Spacing.xs.desktop },
      },
      endIcon: {
        [basicMuiTheme.breakpoints.up('mobile')]: { marginInlineStart: SizesAndSpaces.Spacing.xs.mobile },
        [basicMuiTheme.breakpoints.up('tablet')]: { marginInlineStart: SizesAndSpaces.Spacing.xs.tablet },
        [basicMuiTheme.breakpoints.up('desktop')]: { marginInlineStart: SizesAndSpaces.Spacing.xs.desktop },
      },
    },
  }
}
