import type { HealthMode } from './llamalend.types'

/**
 * Preset options for borrowing
 * @see BORROW_PRESET_RANGES
 **/
export enum BorrowPreset {
  Safe = 'Safe',
  MaxLtv = 'MaxLtv',
  Custom = 'Custom',
}

export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
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
