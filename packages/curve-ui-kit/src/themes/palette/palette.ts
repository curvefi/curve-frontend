import { PaletteOptions } from '@mui/material'
import { DesignSystem } from '../design'

export const createPalette = (
  mode: 'light' | 'dark',
  { Layer, Color, Text: { TextColors } }: DesignSystem,
): PaletteOptions => ({
  mode,
  primary: { main: Color.Primary[500] },
  secondary: { main: Color.Secondary[500] },
  error: { main: Layer.Feedback.Error, contrastText: TextColors.Feedback.Error },
  info: { main: Layer.Feedback.Info, contrastText: TextColors.Primary },
  warning: { main: Layer.Feedback.Warning, contrastText: TextColors.Feedback.Warning },
  success: { main: Layer.Feedback.Success, contrastText: TextColors.Feedback.Success },
  text: {
    primary: TextColors.Primary,
    secondary: TextColors.Secondary,
    tertiary: TextColors.Tertiary,
    disabled: TextColors.Disabled,
    highlight: TextColors.Highlight,
  },
  action: {
    // note: action, disabled, focus themes are left default for now
    hover: Layer.TypeAction.Hover,
    selected: Layer.TypeAction.Selected,
  },
  background: { default: Layer.App.Background, paper: Layer[2].Fill },
  divider: Layer[1].Outline,
})

export type Palette = ReturnType<typeof createPalette>
