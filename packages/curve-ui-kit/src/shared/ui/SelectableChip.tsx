import Chip, { ChipProps } from '@mui/material/Chip'
import { CancelIcon } from '@ui-kit/shared/icons/CancelIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export type SelectableChipProps = {
  selected: boolean
  toggle: () => void
  showCancelIcon?: boolean
} & ChipProps
/**
 * Renders a chip that can be selected or deselected.
 * This customizes the MUI Chip component to change color and icon based on selection state.
 * The delete icon is always visible, but hidden when the chip is not selected with some transition.
 * @param showCancelIcon - Whether to show the cancel icon when selected (default: true)
 */
export const SelectableChip = ({ selected, toggle, showCancelIcon = true, ...props }: SelectableChipProps) => (
  <Chip
    size="small"
    clickable
    color={selected ? 'selected' : 'unselected'}
    // CancelIcon is rendered if there is a onDelete handler
    onDelete={showCancelIcon ? toggle : undefined}
    onClick={toggle}
    deleteIcon={
      showCancelIcon ? (
        <CancelIcon
          sx={{
            transition: `width ${TransitionFunction}, height ${TransitionFunction}`,
            ...(!selected && { '&&&': { width: 0, height: 0 } }),
          }}
        />
      ) : undefined
    }
    {...props}
  />
)
