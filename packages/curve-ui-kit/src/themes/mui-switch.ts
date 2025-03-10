import type { Components } from '@mui/material/styles'
import { DesignSystem } from './design'

export const defineMuiSwitch = ({
  Switch: { Default, Checked },
  Button: { Focus_Outline },
}: DesignSystem): Components['MuiSwitch'] => ({
  styleOverrides: {
    root: {
      padding: 0,
      ':focus-within': {
        '.MuiSwitch-track': {
          borderColor: Focus_Outline,
        },
      },
    },
    switchBase: { borderRadius: 0, '&.Mui-checked+.MuiSwitch-track': { opacity: 1 } },
    track: {
      borderRadius: 0,
      backgroundColor: Default.Fill,
      border: `1px solid ${Default.Outline}`,
      '.Mui-checked &': {
        backgroundColor: Checked.Fill,
        borderColor: Checked.Outline,
      },
    },
    thumb: {
      borderRadius: 0,
      color: Default.Label,
      '.Mui-checked &': { color: Checked.Label },
    },
  },
})
