import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import type { Components } from '@mui/material/styles'

export const defineMuiIconButton = ({ Layer, Text }: DesignSystem): Components['MuiIconButton'] => ({
  styleOverrides: {
    root: {
      borderRadius: '0',
      padding: 0,
      '&.current': {
        fill: Text.TextColors.Highlight,
        backgroundColor: Layer[1].Fill,
        borderStyle: 'solid',
        borderColor: Layer.Highlight.Outline,
        borderWidth: SizesAndSpaces.OutlineWidth,
      },
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
    }
  },
})
