/// <reference path="./mui-icon-button.d.ts" />
import { recordEntries } from '@curvefi/primitives/objects.utils'
import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'
import { Fonts } from '../../fonts'
import { buttonColor } from './utils'

const { ButtonSize, OutlineWidth, IconSize } = SizesAndSpaces

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
      sizeExtraExtraSmall: {
        height: ButtonSize.xs,
        minWidth: ButtonSize.xs,
        '& svg': handleBreakpoints({ width: IconSize.xs, height: IconSize.xs }),
      },
      sizeExtraSmall: {
        height: ButtonSize.xs,
        minWidth: ButtonSize.xs,
        '& svg': handleBreakpoints({ width: IconSize.md, height: IconSize.md }),
      },
      sizeSmall: {
        height: ButtonSize.sm,
        minWidth: ButtonSize.sm,
        '& svg': handleBreakpoints({ width: IconSize.lg, height: IconSize.lg }),
      },
      sizeMedium: {
        height: ButtonSize.md,
        minWidth: ButtonSize.md,
        '& svg': handleBreakpoints({ width: IconSize.xl, height: IconSize.xl }),
      },
      sizeLarge: {
        height: ButtonSize.lg,
        minWidth: ButtonSize.lg,
        '& svg': handleBreakpoints({ width: IconSize.xxl, height: IconSize.xxl }),
      },
      loadingIndicator: {
        // IconButton sizes change the size of all svg, but the loading indicator gets larger than its container
        svg: { maxWidth: '100%', maxHeight: '100%' },
      },
    },
  }
}
