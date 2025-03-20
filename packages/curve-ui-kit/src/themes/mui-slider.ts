import type { Components } from '@mui/material/styles'
import { DesignSystem } from '@ui-kit/themes/design'

export const defineMuiSlider = (design: DesignSystem): Components['MuiSlider'] => ({
  styleOverrides: {
    track: { height: 20, borderRadius: 0 },
    thumb: {
      borderRadius: 0,
      background: `${design.Color.Neutral[950]} url(${design.Inputs.SliderThumbImage}) center no-repeat`,
      '&:hover': {
        filter: 'invert(1)',
      },
    },
  },
})
