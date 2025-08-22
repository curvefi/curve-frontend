/// <reference path="./mui-icon-button.d.ts" />
import type { Components } from '@mui/material/styles'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '../../design'
import { SizesAndSpaces } from '../../design/1_sizes_spaces'
import { Fonts } from '../../fonts'

const { ButtonSize, OutlineWidth, IconSize } = SizesAndSpaces

// note: should use IconSize instead of ButtonSize? Plus introduce many more sizes (xs to 4xl)
export const defineMuiIconButton = ({ Button, Layer, Text }: DesignSystem): Components['MuiIconButton'] => ({
  styleOverrides: {
    root: {
      height: ButtonSize.sm,
      minWidth: ButtonSize.sm,
      border: `${OutlineWidth} solid transparent`,
      borderRadius: '0',
      padding: 0,
      color: Button.Ghost.Default.Label,
      transition: Button.Transition,
      '&.current': { borderColor: Layer.Highlight.Outline },
      ':focus-visible': { borderColor: Layer.Highlight.Outline },
      '&:hover': { color: Button.Ghost.Hover.Label, backgroundColor: 'transparent', filter: 'saturate(2)' },
      fontFamily: Fonts[Text.FontFamily.Button],
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
    // colorPrimary: { '&:hover': { color: Button.Primary.Hover.Label, backgroundColor: Button.Primary.Hover.Fill } },
    // colorSecondary: { '&:hover': { color: Button.Secondary.Hover.Label, backgroundColor: Button.Secondary.Hover.Fill } },
    // colorError: { '&:hover': { color: Button.Error.Hover.Label, backgroundColor: Button.Error.Hover.Fill } },
    // colorInfo: { '&:hover': { color: Button.Info.Hover.Label, backgroundColor: Button.Info.Hover.Fill } },
    // colorSuccess: { '&:hover': { color: Button.Success.Hover.Label, backgroundColor: Button.Success.Hover.Fill } },
    // colorWarning: { '&:hover': { color: Button.Warning.Hover.Label, backgroundColor: Button.Warning.Hover.Fill } },
    loadingIndicator: {
      // IconButton sizes change the size of all svg, but the loading indicator gets larger than its container
      svg: { maxWidth: '100%', maxHeight: '100%' },
    },
  },
})
