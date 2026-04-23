// eslint-disable-next-line no-restricted-imports
import Chip, { ChipProps } from '@mui/material/Chip'

type SelectableChipVariant = 'outlined' | NonNullable<ChipProps['variant']>

export type SelectableChipProps = {
  selected: boolean
  toggle: () => void
  variant?: SelectableChipVariant
} & Omit<ChipProps, 'clickable' | 'color' | 'onClick' | 'deleteIcon' | 'variant' | 'onDelete'>

/** This is needed because the MUI "outlined" variant overrids the custom style in the mui-chip.ts file (e.g. background color) */
const VARIANT_MAP: Record<SelectableChipVariant, ChipProps['variant']> = {
  outlined: undefined,
  ghost: 'ghost',
}
/**
 * Renders a chip that can be selected or deselected.
 * This customizes the MUI Chip component to change color and icon based on selection state.
 * The delete icon is always visible, but hidden when the chip is not selected with some transition.
 */
export const SelectableChip = ({ selected, toggle, variant = 'outlined', ...props }: SelectableChipProps) => (
  <Chip
    size="medium"
    clickable
    variant={VARIANT_MAP[variant]}
    color={selected ? 'selected' : 'unselected'}
    onClick={toggle}
    {...props}
  />
)
