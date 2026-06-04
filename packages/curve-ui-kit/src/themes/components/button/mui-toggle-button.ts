// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- referring to a type definition file
/// <reference path="./mui-toggle-button.d.ts" />
import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '../../basic-theme'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'

const { Spacing, ButtonSize, FontSize, LineHeight, OutlineWidth } = SizesAndSpaces

type ToggleStyle = { Label?: string; Fill?: string }

const toggleStyle = ({ Label, Fill }: ToggleStyle) => ({ color: Label, backgroundColor: Fill })

type BaseButtonSize = {
  fontSize: keyof typeof FontSize
  fontWeight?: keyof DesignSystem['Text']['FontWeight']
  lineHeight: keyof typeof LineHeight
}

type ButtonSize = BaseButtonSize & {
  minHeight: keyof typeof ButtonSize
  minWidth: keyof typeof ButtonSize
  paddingBlock: keyof typeof Spacing
  paddingInline: keyof typeof Spacing
}

const buttonSize = (
  fontWeightTokens: DesignSystem['Text']['FontWeight'],
  { minHeight, minWidth, paddingBlock, paddingInline, fontSize, fontWeight = 'Bold', lineHeight }: ButtonSize,
) =>
  handleBreakpoints({
    minHeight: ButtonSize[minHeight],
    minWidth: ButtonSize[minWidth],
    paddingBlock: Spacing[paddingBlock],
    paddingInline: Spacing[paddingInline],
    fontSize: FontSize[fontSize],
    fontWeight: fontWeightTokens[fontWeight],
    lineHeight: LineHeight[lineHeight],
  })

type ButtonSizeSquare = BaseButtonSize & {
  size: keyof typeof ButtonSize
  padding: keyof typeof Spacing
}

const buttonSizeSquare = (
  fontWeightTokens: DesignSystem['Text']['FontWeight'],
  { size, padding, fontSize, fontWeight = 'Bold', lineHeight }: ButtonSizeSquare,
) =>
  handleBreakpoints({
    minHeight: ButtonSize[size],
    minWidth: ButtonSize[size],
    height: ButtonSize[size],
    width: ButtonSize[size],
    paddingBlock: Spacing[padding],
    paddingInline: Spacing[padding],
    fontSize: FontSize[fontSize],
    fontWeight: fontWeightTokens[fontWeight],
    lineHeight: LineHeight[lineHeight],
    overflow: 'hidden',
  })

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
        textTransform: 'uppercase',
      },

      sizeExtraSmall: {
        ...buttonSize(Text.FontWeight, {
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
        ...buttonSizeSquare(Text.FontWeight, {
          size: 'xs',
          padding: 'xs',
          fontSize: 'sm',
          lineHeight: 'sm',
        }),
        textTransform: 'none',
      },

      sizeSmall: buttonSize(Text.FontWeight, {
        minHeight: 'sm',
        minWidth: 'sm',
        paddingBlock: 'sm',
        paddingInline: 'md',
        fontSize: 'sm',
        lineHeight: 'sm',
      }),

      sizeSmallSquare: buttonSizeSquare(Text.FontWeight, {
        size: 'sm',
        padding: 'sm',
        fontSize: 'sm',
        lineHeight: 'sm',
      }),

      sizeMedium: buttonSize(Text.FontWeight, {
        minHeight: 'md',
        minWidth: 'md',
        paddingBlock: 'sm',
        paddingInline: 'md',
        fontSize: 'md',
        lineHeight: 'xl',
      }),

      sizeMediumSquare: buttonSizeSquare(Text.FontWeight, {
        size: 'md',
        padding: 'sm',
        fontSize: 'md',
        lineHeight: 'xl',
      }),
    },
  }
}
