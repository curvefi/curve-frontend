import { type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'

export const getDefaultSelectableChipSize = (isMobile: boolean): NonNullable<SelectableChipProps['size']> =>
  isMobile ? 'medium' : 'small'
