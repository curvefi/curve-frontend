import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import { Sizing, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { applySxProps } from '@ui-kit/utils'

export const SelectableCard = ({
  isSelected,
  sx,
  ...props
}: Omit<ButtonBaseProps<typeof Card>, 'component'> & {
  isSelected: boolean
}) => (
  <ButtonBase
    component={Card}
    sx={applySxProps(
      (t) => ({
        backgroundColor: isSelected ? t.design.Layer.TypeAction.Selected : t.design.Layer[1].Fill,
        outlineStyle: 'solid',
        outlineWidth: Sizing[10],
        outlineColor: isSelected ? t.design.Layer.Highlight.Outline : t.design.Layer[1].Outline,
        outlineOffset: `-${Sizing[10]}`,
        transition: `background-color ${TransitionFunction}, outline-color ${TransitionFunction}`,
        '&:hover, &.cypress-hover': {
          backgroundColor: t.design.Layer.TypeAction.Hover,
        },
      }),
      sx,
    )}
    {...props}
  />
)
