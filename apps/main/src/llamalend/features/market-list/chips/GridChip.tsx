import { type GridProps } from '@mui/material/Grid'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { ChipGridItem } from './ChipGridItem'

/** A <GridItem> with a SelectableChip inside */
export const GridChip = ({ size, ...props }: Omit<SelectableChipProps, 'size'> & { size?: GridProps['size'] }) => (
  <ChipGridItem size={size}>
    <SelectableChip {...props} sx={{ width: 'auto' }} />
  </ChipGridItem>
)
