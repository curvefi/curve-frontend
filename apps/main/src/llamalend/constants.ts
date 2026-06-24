import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
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

/**
 * Reference cutoff date used to infer and display the Llamalend market version in the UI, until the price API returns the version explicitly.
 */
export const LLAMMALEND_V2_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025

export const MarketTypeSuffix: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`(Lending Markets)`,
  [LlamaMarketType.Mint]: t`(Mint Markets)`,
}

export const NET_SUPPLY_RATE_TITLE = t`Net supply APY`
export const USER_NET_SUPPLY_RATE_TITLE = t`Your net supply APY`

export const LEVERAGE = 'leverage' as const satisfies SlippageType
