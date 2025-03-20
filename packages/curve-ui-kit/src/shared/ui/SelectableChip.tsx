import Chip, { ChipProps } from '@mui/material/Chip'
import { CancelIcon } from '@ui-kit/shared/icons/CancelIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

/**
 * Renders a chip that can be selected or deselected.
 * This customizes the MUI Chip component to change color and icon based on selection state.
 * The delete icon is always visible, but hidden when the chip is not selected with some transition.
 */
export const SelectableChip = ({
  selected,
  toggle,
  ...props
}: {
  selected: boolean
  toggle: () => void
} & ChipProps) => (
  <Chip
    size="large"
    clickable
    color={selected ? 'selected' : 'unselected'}
    onDelete={toggle}
    onClick={toggle}
    deleteIcon={
      <CancelIcon
        sx={{
          transition: `width ${TransitionFunction}, height ${TransitionFunction}`,
          ...(!selected && { '&&&': { width: 0, height: 0 } }),
        }}
      />
    }
    {...props}
  />
)
