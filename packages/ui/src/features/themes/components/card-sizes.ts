export const CARD_SIZES = ['extraSmall', 'small', 'medium'] as const

export type CardSize = (typeof CARD_SIZES)[number]
