import { DesignSystem } from './design'
import type { Components } from '@mui/material/styles'

export const defineMuiSwitch = ({ Switch: { Default, Checked } }: DesignSystem): Components['MuiSwitch'] => ({
  styleOverrides: {
    root: { padding: 0 },
    switchBase: { borderRadius: 0, '&.Mui-checked+.MuiSwitch-track': { opacity: 1 } },
    track: {
      borderRadius: 0,
      backgroundColor: Default.Fill,
      border: `1px solid ${Default.Outline}`,
      '.Mui-checked &': {
        backgroundColor: Checked.Fill,
        border: `1px solid ${Checked.Outline}`,
      },
    },
    thumb: {
      borderRadius: 0,
      color: Default.Label,
      '.Mui-checked &': { color: Checked.Label },
    },
  },
})
