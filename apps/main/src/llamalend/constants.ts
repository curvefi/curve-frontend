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

export const LLAMA_MONITOR_BOT_URL = 'https://t.me/LlamalendMonitorBot'

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
 * Filter out markets after a certain creation date because they're unsafe to use until Llamalend V2 is live.
 */
export const MARKET_CUTOFF_DATE = new Date('2025-11-12T00:00:00Z') // November 12, 2025
