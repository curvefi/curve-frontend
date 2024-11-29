import { DesignSystem } from '../design'
import { Fonts } from '../typography'

export const defineMuiIconButton = ({ Layer, Text }: DesignSystem) => ({
  styleOverrides: {
    root: {
      borderRadius: '0',
      '&.current': {
        fill: Text.TextColors.Highlight,
        backgroundColor: Layer[1].Fill,
        borderStyle: 'solid',
        borderColor: Layer.Highlight.Outline,
        borderWidth: '1px',
        height: '40px',
      },
      fontFamily: Fonts[Text.FontFamily.Button],
    },
  },
})
