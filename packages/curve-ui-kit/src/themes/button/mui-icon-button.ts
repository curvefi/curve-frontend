import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import type { Components } from '@mui/material/styles'

export const defineMuiIconButton = ({ Button, Layer, Text }: DesignSystem): Components['MuiIconButton'] => ({
  styleOverrides: {
    root: {
      height: SizesAndSpaces.ButtonSize.sm,
      minWidth: SizesAndSpaces.ButtonSize.sm,
      borderRadius: '0',
      padding: 0,
      color: Button.Ghost.Default.Label,
      '&.current': {
        borderStyle: 'solid',
        borderColor: Layer.Highlight.Outline,
        borderWidth: SizesAndSpaces.OutlineWidth,
      },
      '&:hover': { color: Button.Ghost.Hover.Label, backgroundColor: 'transparent' },
      fontFamily: Fonts[Text.FontFamily.Button],
    },
    sizeSmall: {
      height: SizesAndSpaces.ButtonSize.sm,
      minWidth: SizesAndSpaces.ButtonSize.sm,
    },
    sizeMedium: {
      height: SizesAndSpaces.ButtonSize.md,
      minWidth: SizesAndSpaces.ButtonSize.md,
    },
    sizeLarge: {
      height: SizesAndSpaces.ButtonSize.lg,
      minWidth: SizesAndSpaces.ButtonSize.lg,
    },
    // colorPrimary: { '&:hover': { color: Button.Primary.Hover.Label, backgroundColor: Button.Primary.Hover.Fill } },
    // colorSecondary: { '&:hover': { color: Button.Secondary.Hover.Label, backgroundColor: Button.Secondary.Hover.Fill } },
    // colorError: { '&:hover': { color: Button.Error.Hover.Label, backgroundColor: Button.Error.Hover.Fill } },
    // colorInfo: { '&:hover': { color: Button.Info.Hover.Label, backgroundColor: Button.Info.Hover.Fill } },
    // colorSuccess: { '&:hover': { color: Button.Success.Hover.Label, backgroundColor: Button.Success.Hover.Fill } },
    // colorWarning: { '&:hover': { color: Button.Warning.Hover.Label, backgroundColor: Button.Warning.Hover.Fill } },
  },
})
