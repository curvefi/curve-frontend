import { type SelectableChipProps } from '@ui/components/SelectableChip'

export const getDefaultSelectableChipSize = (isMobile: boolean): NonNullable<SelectableChipProps['size']> =>
  isMobile ? 'medium' : 'small'
