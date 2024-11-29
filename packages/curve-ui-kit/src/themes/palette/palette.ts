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
    disabled: Text.TextColors.Disabled,
    // highlight: Text.TextColors.Highlight,
  },
  // curve design language
  // inputs: {
  //   fill: Inputs.Base.Default.Fill,
  //   largeFill: Inputs.Large.Default.Fill,
  //   border: Inputs.Base.Default.Border,
  //   nested: Inputs.Base.Nested.Nested,
  //   nestedFill: Inputs.Base.Nested.Fill,
  //   nestedBorder: Inputs.Base.Nested.Border.Default,
  //   nestedBorderActive: Inputs.Base.Nested.Border.Active,
  //   nestedBorderFilled: Inputs.Base.Nested.Border.Filled,
  //   nestedBorderError: Inputs.Base.Nested.Border.Error,
  // },
  // tabs: {
  //
  // },
  // toggles: {
  //
  // },
  // table: {
  //
  // },
  // button: {
  //
  // },

  // TODO: divider: string,
  // TODO: action: active, hover, hoverOpacity, selected, selectedOpacity, disabled, disabledOpacity, disabledBackground, focus, focusOpacity, activatedOpacity
  background: {
    // used by MUI
    default: Layer.App.Background,
    paper: Layer[1].Fill,
    // curve design language
    // layer1Fill: Layer[1].Fill,
    // layer1Outline: Layer[1].Outline,
    // layer2Fill: Layer[2].Fill,
    // layer2Outline: Layer[2].Outline,
    // layer3Fill: Layer[3].Fill,
    // layer3Outline: Layer[3].Outline,
    // highlightOutline: Layer.Highlight.Outline,
    // highlightFill: Layer.Highlight.Fill,
  },
})

export type Palette = ReturnType<typeof createPalette>
