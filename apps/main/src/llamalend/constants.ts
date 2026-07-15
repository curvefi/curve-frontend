import { t } from '@ui-kit/lib/i18n'
import { MarketType } from '@ui-kit/types/market'
import type { SlippageType } from '@ui-kit/widgets/SlippageSettings'

/**
 * Preset options for loan creation
 * @see PRESET_RANGES
 **/
export enum LoanPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export const PRESET_RANGES = {
  [LoanPreset.Safe]: 50,
  [LoanPreset.MaxLtv]: 4,
  [LoanPreset.Custom]: 10,
}

export const MarketTypeSuffix: Record<MarketType, string> = {
  [MarketType.Lend]: t`(Lending Markets)`,
  [MarketType.Mint]: t`(Mint Markets)`,
}

export const NET_SUPPLY_RATE_TITLE = t`Net supply APY`
export const USER_NET_SUPPLY_RATE_TITLE = t`Your net supply APY`

export const LEVERAGE = 'leverage' as const satisfies SlippageType

/** Any v1 lend market created after this date is considered deprecated. */
export const LEND_V1_DEPRECATION_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025
