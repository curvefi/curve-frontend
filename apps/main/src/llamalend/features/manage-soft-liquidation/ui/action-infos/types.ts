import type { TypographyProps } from '@mui/material/Typography'
import type { PreciseNumber } from '@ui-kit/utils'

/**
 * Describes a change in value for a certain action info. The `next` value is optional as we await input.
 *
 * @remarks Property names used to be 'old' and 'new', but you can't destructure 'new' as it's a reserved keyword.
 * Sometimes there's also no 'next', so having just 'old' made no sense either, hence it's called 'current' instead.
 */
export type Delta = { current: PreciseNumber; next?: PreciseNumber }

/** Simple combination of a token symbol with a certain amount */
export type TokenAmount = { symbol: string; amount: PreciseNumber }

/** Short-hand type for MUI Typography color */
export type TextColor = TypographyProps['color']
