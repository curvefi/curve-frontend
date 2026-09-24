import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { decimalEqual } from '@ui/lib/decimal'

/**
 * The old familiar issue where Typography default line height is too big when being used in a small component.
 * The bottom margin of the text ends up being larger than the top half, messing with the vertical alignment.
 * We ought to find a better solution for it one day, but for now this'll do the trick.
 */
export const VERTICAL_CENTER_TEXT = { '&': { lineHeight: 'normal' } }

/** Converts two decimals to BigNumber for comparison */
export const bigNumEquals = (a?: Decimal, b?: Decimal) => maybes([a, b], decimalEqual) ?? a == b
