import type { TypographyProps } from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'

/**
 * Describes a change in value for a certain action info. The `next` value is optional as we await input.
 *
 * @remarks Property names used to be 'old' and 'new', but you can't destructure 'new' as it's a reserved keyword.
 * Sometimes there's also no 'next', so having just 'old' made no sense either, hence it's called 'current' instead.
 */
export type Delta = { current: number; next?: number }

/** Simple combination of a token symbol with a certain amount */
export type TokenAmount = { symbol: string; amount: Decimal }

/** Short-hand type for MUI Typography color */
export type TextColor = TypographyProps['color']
