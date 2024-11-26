import { Palette } from '../palette'

export const defineMuiIconButton = (palette: Palette) => ({
  styleOverrides: {
    root: {
      borderRadius: '0',
      '&.current': {
        fill: palette.text.highlight,
        backgroundColor: palette.background.layer1Fill,
        borderStyle: 'solid',
        borderColor: palette.background.highlightOutline,
        borderWidth: '1px',
        height: '40px',
      }
    }
  }
})
