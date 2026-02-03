import { forwardRef } from 'react'
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import { Sizing, TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export type SelectableCardProps = Omit<ButtonBaseProps<typeof Card>, 'component'> & {
  isSelected?: boolean
}

export const SelectableCard = forwardRef<HTMLDivElement, SelectableCardProps>(
  ({ isSelected = false, sx, ...props }, ref) => (
    <ButtonBase
      ref={ref}
      component={Card}
      sx={[
        (t) => ({
          backgroundColor: t.design.Layer[1].Fill,
          outlineStyle: 'solid',
          outlineWidth: Sizing[10],
          outlineColor: isSelected ? t.design.Layer.Highlight.Outline : t.design.Layer[1].Outline,
          outlineOffset: `-${Sizing[10]}`,
          transition: `background-color ${TransitionFunction}, outline-color ${TransitionFunction}`,
          '&:hover': {
            backgroundColor: t.design.Layer.TypeAction.Hover,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  ),
)

SelectableCard.displayName = 'SelectableCard'
