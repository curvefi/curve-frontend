import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import type { Components } from '@mui/material/styles'

const { ButtonSize, OutlineWidth } = SizesAndSpaces

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
    sizeSmall: {
      height: ButtonSize.sm,
      minWidth: ButtonSize.sm,
    },
    sizeMedium: {
      height: ButtonSize.md,
      minWidth: ButtonSize.md,
    },
    sizeLarge: {
      height: ButtonSize.lg,
      minWidth: ButtonSize.lg,
    },
    // colorPrimary: { '&:hover': { color: Button.Primary.Hover.Label, backgroundColor: Button.Primary.Hover.Fill } },
    // colorSecondary: { '&:hover': { color: Button.Secondary.Hover.Label, backgroundColor: Button.Secondary.Hover.Fill } },
    // colorError: { '&:hover': { color: Button.Error.Hover.Label, backgroundColor: Button.Error.Hover.Fill } },
    // colorInfo: { '&:hover': { color: Button.Info.Hover.Label, backgroundColor: Button.Info.Hover.Fill } },
    // colorSuccess: { '&:hover': { color: Button.Success.Hover.Label, backgroundColor: Button.Success.Hover.Fill } },
    // colorWarning: { '&:hover': { color: Button.Warning.Hover.Label, backgroundColor: Button.Warning.Hover.Fill } },
  },
})
