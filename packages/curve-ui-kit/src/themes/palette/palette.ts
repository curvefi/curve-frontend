import { DesignSystem } from '../design'
import { PaletteOptions } from '@mui/material'

export const createPalette = (
  mode: 'light' | 'dark',
  { Layer, Color, Feedback, Text }: DesignSystem,
): PaletteOptions => ({
  // used by MUI
  mode,
  // todo: check if we need the dark/light/contrastText options
  primary: { main: Color.Primary[500] },
  secondary: { main: Color.Secondary[500] },
  error: { main: Feedback.Error },
  warning: { main: Feedback.Warning },
  success: { main: Feedback.Success },
  text: {
    primary: Text.TextColors.Primary,
    secondary: Text.TextColors.Secondary,
    tertiary: Text.TextColors.Tertiary,
    disabled: Text.TextColors.Disabled,
    highlight: Text.TextColors.Highlight,
  },
  background: {
    // used by MUI
    default: Layer.App.Background,
    paper: Layer[3].Fill,
  },
})

export type Palette = ReturnType<typeof createPalette>
