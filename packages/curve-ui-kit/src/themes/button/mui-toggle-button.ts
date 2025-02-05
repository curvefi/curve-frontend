import { basicMuiTheme, type Responsive } from '../basic-theme'
import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import type { Breakpoint } from '@mui/material'
import type { Components } from '@mui/material/styles'

const { Spacing, ButtonSize, FontSize, FontWeight, LineHeight, OutlineWidth } = SizesAndSpaces

type ToggleStyle = { Label?: string; Fill?: string }

const toggleStyle = ({ Label, Fill }: ToggleStyle) => ({
  color: Label,
  backgroundColor: Fill,
})

const sizeBreakpoint = (
  breakpoint: Breakpoint,
  minHeight: string,
  minWidth: string,
  paddingBlock: Responsive,
  paddingInline: Responsive,
  fontSize: Responsive,
  lineHeight: Responsive,
  size?: string,
) => ({
  [basicMuiTheme.breakpoints.up(breakpoint)]: {
    minHeight,
    minWidth,
    ...(size && { height: size, width: size }),
    paddingBlock: paddingBlock[breakpoint],
    paddingInline: paddingInline[breakpoint],
    fontSize: fontSize[breakpoint],
    fontWeight: FontWeight.Bold,
    lineHeight: lineHeight[breakpoint],
  },
})

type BaseButtonSize = {
  fontSize: keyof typeof FontSize
  lineHeight: keyof typeof LineHeight
}

type ButtonSize = BaseButtonSize & {
  minHeight: keyof typeof ButtonSize
  minWidth: keyof typeof ButtonSize
  paddingBlock: keyof typeof Spacing
  paddingInline: keyof typeof Spacing
}

const buttonSize = ({ minHeight, minWidth, paddingBlock, paddingInline, fontSize, lineHeight }: ButtonSize) => {
  const sizes = [
    ButtonSize[minHeight],
    ButtonSize[minWidth],
    Spacing[paddingBlock],
    Spacing[paddingInline],
    FontSize[fontSize],
    LineHeight[lineHeight],
  ] as const

  return {
    ...sizeBreakpoint('mobile', ...sizes),
    ...sizeBreakpoint('tablet', ...sizes),
    ...sizeBreakpoint('desktop', ...sizes),
  }
}

type ButtonSizeSquare = BaseButtonSize & {
  size: keyof typeof ButtonSize
  padding: keyof typeof Spacing
}

const buttonSizeSquare = ({ size, padding, fontSize, lineHeight }: ButtonSizeSquare) => {
  const sizes = [
    ButtonSize[size],
    ButtonSize[size],
    Spacing[padding],
    Spacing[padding],
    FontSize[fontSize],
    LineHeight[lineHeight],
    ...(size && [ButtonSize[size]]),
  ] as const

  return {
    ...sizeBreakpoint('mobile', ...sizes),
    ...sizeBreakpoint('tablet', ...sizes),
    ...sizeBreakpoint('desktop', ...sizes),
    overflow: 'hidden',
  }
}

export const defineMuiToggleButton = ({ Toggles, Button, Text }: DesignSystem): Components['MuiToggleButton'] => {
  const { Default, Hover, Current } = Toggles

  return {
    styleOverrides: {
      root: {
        ...toggleStyle(Default),
        '&:hover': toggleStyle(Hover),
        '&.Mui-selected': toggleStyle(Current),
        '&.Mui-selected:hover': toggleStyle(Current),
        '&&': {
          margin: 0,
        },

        border: `${OutlineWidth} solid transparent !important`, // Not even '&&' works, hence the !important
        borderRadius: 0,
        transition: Button.Transition,
        fontFamily: Fonts[Text.FontFamily.Button],
        textTransform: 'uppercase',
      },

      sizeExtraSmall: {
        ...buttonSize({
          minHeight: 'xs',
          minWidth: 'sm',
          paddingBlock: 'xs',
          paddingInline: 'sm',
          fontSize: 'sm',
          lineHeight: 'sm',
        }),
        textTransform: 'none',
      },

      sizeExtraSmallSquare: {
        ...buttonSizeSquare({
          size: 'xs',
          padding: 'xs',
          fontSize: 'sm',
          lineHeight: 'sm',
        }),
        textTransform: 'none',
      },

      sizeSmall: buttonSize({
        minHeight: 'sm',
        minWidth: 'sm',
        paddingBlock: 'sm',
        paddingInline: 'md',
        fontSize: 'sm',
        lineHeight: 'sm',
      }),

      sizeSmallSquare: buttonSizeSquare({
        size: 'sm',
        padding: 'sm',
        fontSize: 'sm',
        lineHeight: 'sm',
      }),

      sizeMedium: buttonSize({
        minHeight: 'md',
        minWidth: 'md',
        paddingBlock: 'sm',
        paddingInline: 'md',
        fontSize: 'md',
        lineHeight: 'xl',
      }),

      sizeMediumSquare: buttonSizeSquare({
        size: 'md',
        padding: 'sm',
        fontSize: 'md',
        lineHeight: 'xl',
      }),
    },
  }
}
