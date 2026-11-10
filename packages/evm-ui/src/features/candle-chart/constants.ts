/**
 * Scale margins applied to the candle chart's right price scale.
 * Any chart synced to the candle chart's visible price range must compensate
 * for these margins to keep price levels visually aligned.
 */
export const PRICE_SCALE_MARGINS = { top: 0.1, bottom: 0.1 } as const
