import { type GridProps } from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { getDefaultSelectableChipSize } from '@ui-kit/shared/ui/selectable-chip.utils'
import { SelectableChip, type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { ChipGridItem } from './ChipGridItem'

/** A <GridItem> with a SelectableChip inside */
export const GridChip = ({
  size,
  selectableChipSize,
  ...props
}: Omit<SelectableChipProps, 'size'> & {
  size?: GridProps['size']
  selectableChipSize?: SelectableChipProps['size']
}) => {
  const isMobile = useIsMobile()
  return (
    <ChipGridItem size={size}>
      <SelectableChip
        {...props}
        size={selectableChipSize ? selectableChipSize : getDefaultSelectableChipSize(isMobile)}
        sx={{ width: { mobile: '100%', tablet: 'auto' } }}
      />
    </ChipGridItem>
  )
}
