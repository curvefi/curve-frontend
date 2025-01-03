import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'
import type { Components } from '@mui/material/styles'

const { ButtonSize, OutlineWidth } = SizesAndSpaces

export const defineMuiToggleButton = ({ Button, Layer, Text }: DesignSystem): Components['MuiToggleButton'] => ({
  styleOverrides: {
    root: {
      border: `${OutlineWidth} solid transparent`,
      color: Button.Ghost.Default.Label,
      transition: Button.Transition,
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
  },
})
