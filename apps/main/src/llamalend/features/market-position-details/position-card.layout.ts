import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Desktop columns line up with the card above: health, risk, leverage and APR, equity and PNL. */
export const POSITION_CARD_COLUMNS = { mobile: '1fr', tablet: 'repeat(4, minmax(0, 1fr))' }
export const POSITION_CARD_COLUMN_GAP = Spacing.lg
