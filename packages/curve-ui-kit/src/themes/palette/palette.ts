import { DesignSystem } from '../design'
import { PaletteOptions } from '@mui/material'

export const createPalette = (
  mode: 'light' | 'dark',
  { Layer, Color, Feedback, Text }: DesignSystem,
): PaletteOptions => ({
  mode,
  primary: { main: Color.Primary[500] },
  secondary: { main: Color.Secondary[500] },
  error: { main: Feedback.Error, contrastText: Text.TextColors.Error },
  info: { main: Feedback.Info, contrastText: Text.TextColors.Info },
  warning: { main: Feedback.Warning, contrastText: Text.TextColors.Warning },
  success: { main: Feedback.Success, contrastText: Text.TextColors.Success },
  text: {
    primary: Text.TextColors.Primary,
    secondary: Text.TextColors.Secondary,
    tertiary: Text.TextColors.Tertiary,
    disabled: Text.TextColors.Disabled,
    highlight: Text.TextColors.Highlight,
  },
  action: {
    // note: action, disabled, focus themes are left default for now
    hover: Layer.TypeAction.Hover,
    selected: Layer.TypeAction.Selected,
  },
  background: { default: Layer.App.Background, paper: Layer[1].Fill },
})

export type Palette = ReturnType<typeof createPalette>
