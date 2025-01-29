import type { Components } from '@mui/material'
import { DesignSystem } from '@ui-kit/themes/design'
import { Grays } from '@ui-kit/themes/design/0_primitives'

const invert = (color: DesignSystem['Color']) => color.Neutral[50]

export const defineMuiChip = ({ Chips, Color, Text: { TextColors }, Layer }: DesignSystem): Components['MuiChip'] => ({
  styleOverrides: {
    root: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'transparent',
      color: TextColors.Primary,
    },
  },
  variants: [
    { props: { variant: 'chip' }, style: { borderRadius: 0 } },
    { props: { variant: 'badge' }, style: {} },

    // badge colors not in design system but defined directly in components
    {
      props: { color: 'alert' },
      style: { backgroundColor: Layer.Feedback.Error, color: Grays[50] },
    },
    {
      props: { color: 'default' },
      style: { borderColor: Layer[1].Outline },
    },

    { props: { color: 'active' }, style: { backgroundColor: Color.Secondary[400], color: invert(Color) } },
    { props: { color: 'warning' }, style: { backgroundColor: Color.Tertiary[200] } },
    { props: { color: 'accent' }, style: { backgroundColor: Layer.Highlight.Fill, color: invert(Color) } },
    // chip colors taken from design system variables
    {
      props: { color: 'highlight' },
      style: {
        backgroundColor: invert(Color) || Chips.Current.Fill,
        color: Chips.Current.Label,
        borderColor: Chips.Current.Outline,
      },
    },
    {
      props: { color: 'inactive' },
      style: { color: Chips.Default.Label, backgroundColor: Chips.Default.Fill, borderColor: Chips.Default.Stroke },
    },

    // this is the "hover" state for chips in the design system
    {
      props: { clickable: true },
      style: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: Chips.Hover.Fill,
          color: Chips.Hover.Label,
          '& .MuiChip-deleteIcon': {
            stroke: Chips.Hover.Label,
            fill: Chips.Hover.Label,
          },
        },
      },
    },

    // todo: sizes
  ],
})
