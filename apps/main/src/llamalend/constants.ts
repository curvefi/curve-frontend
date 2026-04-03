import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils/average-categories'
import type { HealthMode } from './llamalend.types'

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

// Enum for the empty state of the user positions table
export enum PositionsEmptyState {
  Error = 'error',
  NoPositions = 'no-positions',
  Filtered = 'filtered',
}

export const DEFAULT_HEALTH_MODE: HealthMode = {
  percent: '',
  colorKey: '',
  icon: null,
  message: null,
  warningTitle: '',
  warning: '',
}

/**
 * Reference cutoff date used to infer and display the Llamalend market version in the UI, until the price API returns the version explicitly.
 */
export const LLAMMALEND_V2_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025

export const MarketTypeSuffix: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`(Lending Markets)`,
  [LlamaMarketType.Mint]: t`(Mint Markets)`,
}

/** Average category config for supply compounding rate  */
export const COMPOUNDING_CATEGORY = AVERAGE_CATEGORIES['llamalend.supplyCompoundingRate']
