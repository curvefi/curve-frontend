import { type SelectableChipProps } from '@evm-ui/shared/ui/SelectableChip'

export const getDefaultSelectableChipSize = (isMobile: boolean): NonNullable<SelectableChipProps['size']> =>
  isMobile ? 'medium' : 'small'
