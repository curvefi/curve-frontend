import { t } from '@ui/lib/i18n'

/**
 * Scale margins applied to the candle chart's right price scale.
 * Any chart synced to the candle chart's visible price range must compensate
 * for these margins to keep price levels visually aligned.
 */
export const PRICE_SCALE_MARGINS = { top: 0.1, bottom: 0.1 } as const

export const LEGACY_SOFT_LIQUIDATION_DESCRIPTION = t`Above the liquidation threshold, health mostly follows price (and slowly declines from interest). In the liquidation range, health drops on any price movement as collateral is worn down inside the bands.`

export const SOFT_LIQUIDATION_DESCRIPTION = t`Above the liquidation range, health follows the price. In the liquidation range, health stays at 1.00 and the liquidation buffer drops on any price movement as collateral is worn down inside the bands.`
