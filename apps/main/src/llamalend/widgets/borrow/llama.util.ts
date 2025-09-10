import { ZeroAddress } from 'ethers'
import type { SetValueConfig } from 'react-hook-form'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { BorrowPreset, type LlamaMarketTemplate } from './borrow.types'

export function getLlamaMarket(id: string): LlamaMarketTemplate {
  const lib = requireLib('llamaApi')
  const mintMarket = lib.getMintMarket(id)
  if (mintMarket) return mintMarket
  const lendMarket = lib.getLendMarket(id)
  if (lendMarket) return lendMarket
  throw new Error(`Market with ID ${id} not found`)
}

export const hasLeverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate
    ? market.leverage.hasLeverage()
    : market.leverageZap !== ZeroAddress || market.leverageV2.hasLeverage()

export const DEFAULT_SLIPPAGE = 0.1 as const

export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
}

export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }
