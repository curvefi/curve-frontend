import { ZeroAddress } from 'ethers'
import type { SetValueConfig } from 'react-hook-form'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { BorrowPreset } from './borrow.types'

export const hasLeverage = (market: MintMarketTemplate | LendMarketTemplate) =>
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
