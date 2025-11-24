import { zeroAddress } from 'viem'
import type { Llamma } from '@/loan/types/loan.types'

/**
 * Mint market version with id < 6 is using v1 (leverageZap)
 * Mint market with id >= 6 is using v2 leverage
 */
export type MintMarketVersion = 'v1' | 'v2'

export const hasV1Leverage = (llamma: Llamma | null) => llamma?.leverageZap !== zeroAddress
export const hasV2Leverage = (llamma: Llamma | null) => !!llamma?.leverageV2.hasLeverage()
export const hasV1Deleverage = (llamma: Llamma | null) => llamma?.deleverageZap !== zeroAddress

export const hasLeverage = (llamma: Llamma | null) => hasV1Leverage(llamma) || hasV2Leverage(llamma)
// hasV2Leverage works for deleverage as well
export const hasDeleverage = (llamma: Llamma | null) => hasV1Deleverage(llamma) || hasV2Leverage(llamma)
