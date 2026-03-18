/// <reference path="./mui-icon-button.d.ts" />
import { IconButtonProps } from '@mui/material/IconButton'
import type { Components } from '@mui/material/styles'
import { recordEntries } from '@primitives/objects.utils'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'
import { Fonts } from '../../fonts'
import { buttonColor } from './utils'

const { ButtonSize, OutlineWidth, IconSize } = SizesAndSpaces

type IconButtonSize = NonNullable<IconButtonProps['size']>

/** size mapping of the svg icons inside the icon buttons */
export const IconButtonIconSize = {
  extraExtraSmall: 'xs',
  extraSmall: 'md',
  small: 'lg',
  medium: 'xl',
  large: 'xxl',
} satisfies Record<IconButtonSize, keyof typeof IconSize>

const iconButtonSize = (designSize: keyof typeof ButtonSize, muiSize: IconButtonSize) => ({
  height: ButtonSize[designSize],
  minWidth: ButtonSize[designSize],
  '& svg': handleBreakpoints({
    width: IconSize[IconButtonIconSize[muiSize]],
    height: IconSize[IconButtonIconSize[muiSize]],
  }),
})

// note: should use IconSize instead of ButtonSize? Plus introduce many more sizes (xs to 4xl)
export const defineMuiIconButton = ({ Button, Text }: DesignSystem): Components['MuiIconButton'] => {
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
    variants: recordEntries(colors).map(([color, style]) => ({ props: { color }, style })),
    styleOverrides: {
      root: {
        height: ButtonSize.sm,
        minWidth: ButtonSize.sm,
        border: `${OutlineWidth} solid transparent`,
        borderRadius: '0',
        padding: 0,
        // default color to Ghost
        ...buttonColor(Ghost),
        transition: Transition,
        ':focus-visible': { borderColor: Focus_Outline },
        fontFamily: Fonts[Text.FontFamily.Button],
      },
      sizeExtraExtraSmall: iconButtonSize('xxs', 'extraExtraSmall'),
      sizeExtraSmall: iconButtonSize('xs', 'extraSmall'),
      sizeSmall: iconButtonSize('sm', 'small'),
      sizeMedium: iconButtonSize('md', 'medium'),
      sizeLarge: iconButtonSize('lg', 'large'),
      loadingIndicator: {
        // IconButton sizes change the size of all svg, but the loading indicator gets larger than its container
        svg: { maxWidth: '100%', maxHeight: '100%' },
      },
    },
  }
}
