// eslint-disable-next-line no-restricted-imports
import Chip, { type ChipProps } from '@mui/material/Chip'

export type BadgeProps = Omit<ChipProps, 'clickable' | 'onClick' | 'onDelete' | 'deleteIcon' | 'variant'>

/** Badge component is the non-clickable MuiChip. MuiBadge is attached to another component, so it cannot be used. */
export const Badge = (props: BadgeProps) => <Chip {...props} />
