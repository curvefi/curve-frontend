import type { Components } from '@mui/material/styles'
import { basicMuiTheme, type Responsive } from '../basic-theme'
import { Fonts } from '../typography'
import { DesignSystem } from '../design'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import { Breakpoint } from '@mui/material'

const { LineHeight, OutlineWidth, FontWeight, ButtonSize, FontSize } = SizesAndSpaces

type ButtonStyle = { Label?: string; Fill?: string; Outline?: string }
type ButtonColor = { Default: ButtonStyle; Disabled?: ButtonStyle; Hover: ButtonStyle; Current?: ButtonStyle }

const buttonStyle = ({ Fill, Label, Outline }: ButtonStyle) => ({
  color: Label,
  backgroundColor: Fill,
  borderColor: Outline,
})

const buttonColor = ({ Default, Disabled, Hover, Current }: ButtonColor) => ({
  ...buttonStyle(Default),
  '&:hover': buttonStyle(Hover),
  '&:disabled': Disabled && buttonStyle(Disabled),
  '&.current': Current && buttonStyle(Current),
})

const sizeBreakpoint = (
  height: string,
  fontSize: Responsive,
  fontWeight: Responsive,
  lineHeight: Responsive,
  breakpoint: Breakpoint,
) => ({
  [basicMuiTheme.breakpoints.up(breakpoint)]: {
    height,
    fontSize: fontSize[breakpoint],
    fontWeight: fontWeight[breakpoint],
    lineHeight: lineHeight[breakpoint],
  },
})

type ButtonSize = { height: keyof typeof ButtonSize; fontSize: keyof typeof FontSize; fontWeight?: keyof typeof FontWeight; lineHeight: keyof typeof LineHeight }
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
  const fontFamily = Fonts[Text.FontFamily.Button]
  return {
    styleOverrides: {
      root: {
        variants: Object.entries(colors).map(([color, style]) => ({ props: { color }, style })),
        borderRadius: 0,
        border: `${OutlineWidth} solid transparent`,
        boxSizing: 'border-box',
        '&:focus': { borderColor: Focus_Outline },
        fontFamily,
        textTransform: 'uppercase',
        transition: Transition,
      },
      sizeExtraSmall: buttonSize({ height: 'xs', fontSize: 'sm', lineHeight: 'md' }),
      sizeSmall: buttonSize({ height: 'sm', fontSize: 'sm', lineHeight: 'md' }),
      sizeMedium: buttonSize({ height: 'md', fontSize: 'md', lineHeight: 'xl' }),
      sizeLarge: buttonSize({ height: 'lg', fontSize: 'md', lineHeight: 'xl' }),
    },
  }
}
