// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- referring to a type definition file
/// <reference path="./mui-button.d.ts" />
import type { ButtonProps } from '@mui/material/Button'
import type { Components } from '@mui/material/styles'
import { recordEntries } from '@primitives/objects.utils'
import { handleBreakpoints } from '../../basic-theme'
import { DesignSystem } from '../../design'
import { Sizing } from '../../design/0_primitives'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'
import { buttonColor } from './utils'

const { LineHeight, OutlineWidth: OUTLINE_WIDTH, ButtonSize, FontSize } = SizesAndSpaces

type ButtonSize = {
  height: keyof typeof ButtonSize
  fontSize: keyof typeof FontSize
  fontWeight?: keyof DesignSystem['Text']['FontWeight']
  lineHeight: keyof typeof LineHeight
}

export const MUI_BUTTON_SIZE = {
  extraSmall: { height: 'xs', fontSize: 'sm', lineHeight: 'md' },
  small: { height: 'sm', fontSize: 'sm', lineHeight: 'md' },
  medium: { height: 'md', fontSize: 'md', lineHeight: 'xl' },
  large: { height: 'lg', fontSize: 'md', lineHeight: 'xl' },
} as const satisfies Record<NonNullable<ButtonProps['size']>, ButtonSize>

const buttonSize = (
  fontWeightTokens: DesignSystem['Text']['FontWeight'],
  { height, fontSize, fontWeight = 'Bold', lineHeight }: ButtonSize,
) =>
  handleBreakpoints({
    height: ButtonSize[height],
    fontSize: FontSize[fontSize],
    fontWeight: fontWeightTokens[fontWeight],
    lineHeight: LineHeight[lineHeight],
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
        border: `${OUTLINE_WIDTH} solid transparent`,
        boxSizing: 'border-box',
        '&:focus-visible': { borderColor: Focus_Outline },
        textTransform: 'uppercase',
        transition: Transition,
      },
      sizeExtraSmall: {
        ...buttonSize(Text.FontWeight, MUI_BUTTON_SIZE.extraSmall),
        textTransform: 'none',
      },
      sizeSmall: buttonSize(Text.FontWeight, MUI_BUTTON_SIZE.small),
      sizeMedium: buttonSize(Text.FontWeight, MUI_BUTTON_SIZE.medium),
      sizeLarge: buttonSize(Text.FontWeight, MUI_BUTTON_SIZE.large),
      startIcon: handleBreakpoints({ marginInlineEnd: SizesAndSpaces.Spacing.xs }),
      endIcon: handleBreakpoints({ marginInlineStart: SizesAndSpaces.Spacing.xs }),
    },
  }
}
