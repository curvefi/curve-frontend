import { DesignSystem } from '../design'
import { Fonts } from '../typography'
import { SizesAndSpaces } from '../design/1_sizes_spaces'

export const defineMuiIconButton = ({ Layer, Text }: DesignSystem) => ({
  styleOverrides: {
    root: {
      height: SizesAndSpaces.ButtonSize.sm,
      minWidth: SizesAndSpaces.ButtonSize.sm,
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
  },
})
