import type { Components } from '@mui/material/styles'
import { basicMuiTheme } from '../basic-theme'
import { Fonts } from '../typography'
import { DesignSystem } from '../design'

export const BUTTONS_HEIGHTS = ['2rem', '2.5rem', '3rem'] as const // 32px, 40px, 48px

type ButtonStyle = { Label?: string; Fill?: string; Outline?: string }
type ButtonColor = { Default: ButtonStyle; Disabled?: ButtonStyle; Hover: ButtonStyle, Current?: ButtonStyle }

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

export const defineMuiButton = ({ Button, Text }: DesignSystem): Components['MuiButton'] => {
  const { Primary, Secondary, Success, Error, Outlined, Ghost, Navigation, Focus_Outline } = Button
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
  const [smallHeight, mediumHeight, largeHeight] = BUTTONS_HEIGHTS
  const [sm, md, lg] = [2, 3, 4].map((i) => basicMuiTheme.spacing(i))
  return {
    styleOverrides: {
      root: {
        variants: Object.entries(colors).map(([color, style]) => ({ props: { color }, style })),
        borderRadius: 0,
        border: `2px solid transparent`,
        boxSizing: 'border-box',
        '&:focus': { borderColor: Focus_Outline },
      },
      sizeLarge: {
        height: largeHeight,
        padding: `0 ${md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${sm}0px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontFamily,
      },
      sizeMedium: {
        height: mediumHeight,
        padding: `0 ${md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${sm}px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontFamily,
      },
      sizeSmall: {
        height: smallHeight,
        padding: `0 ${lg}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${md}px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '16px',
        textTransform: 'uppercase',
        fontFamily,
      },
    },
  }
}
