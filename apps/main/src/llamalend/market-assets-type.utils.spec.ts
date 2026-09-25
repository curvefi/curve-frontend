import { getAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import { getMarketAddressesByAssetsType, getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { MARKETS_LEVERAGE_CONFIG } from '@/llamalend/markets.constants'
import { MarketAssetsType } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'

/** Same lookup as getMarketLeverageSlippage, without importing the SDK-backed llama utils module. */
const leverageSlippage = (chainId: number, controllerAddress: Address | undefined) =>
  (controllerAddress && MARKETS_LEVERAGE_CONFIG[chainId]?.[getAddress(controllerAddress)]?.slippage) ??
  SLIPPAGE.leverage.default

describe('market asset categories', () => {
  it('keeps correlated leverage slippage on the existing stable default', () => {
    const controller = getMarketAddressesByAssetsType(MarketAssetsType.Correlated).find(address =>
      getMarketAssetsType(1, address),
    )
    expect(leverageSlippage(1, controller)).toBe(SLIPPAGE.stable.default)
  })

  it('keeps long-tail leverage slippage on the volatile default', () => {
    const controller = getMarketAddressesByAssetsType(MarketAssetsType.LongTail).find(address =>
      getMarketAssetsType(1, address),
    )
    expect(controller).toBeDefined()
    expect(leverageSlippage(1, controller)).toBe(SLIPPAGE.leverage.default)
  })

  it('maps former volatile markets to blue-chip and keeps their leverage slippage', () => {
    const controller = '0x5756A035F276a8095A922931F224F4ed06149608'
    expect(getMarketAssetsType(1, controller)).toBe(MarketAssetsType.BlueChip)
    expect(leverageSlippage(1, controller)).toBe(SLIPPAGE.leverage.default)
  })
})
