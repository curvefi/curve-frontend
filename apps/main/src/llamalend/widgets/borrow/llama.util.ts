import type { SetValueConfig } from 'react-hook-form'
import { zeroAddress } from 'viem'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { assert } from '@ui-kit/utils'
import { BorrowPreset, type LlamaMarketTemplate } from './borrow.types'

export const getLlamaMarket = (id: string, lib = requireLib('llamaApi')): LlamaMarketTemplate =>
  assert(lib.getMintMarket(id) ?? lib.getLendMarket(id), `Market with ID ${id} not found`)

export const hasLeverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate
    ? market.leverage.hasLeverage()
    : market.leverageZap !== zeroAddress || market.leverageV2.hasLeverage()

export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
}

export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }
