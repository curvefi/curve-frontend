import { ChipProps } from '@mui/material/Chip'
import { type GridProps } from '@mui/material/Grid'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { ChipGridItem } from './ChipGridItem'

/** A <GridItem> with a SelectableChip inside */
export const GridChip = ({
  size,
  selectableChipSize = 'small',
  ...props
}: Omit<SelectableChipProps, 'size'> & { size?: GridProps['size']; selectableChipSize?: ChipProps['size'] }) => (
  <ChipGridItem size={size}>
    <SelectableChip {...props} size={selectableChipSize} sx={{ width: { mobile: '100%', tablet: 'auto' } }} />
  </ChipGridItem>
)
