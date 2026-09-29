import { describe, expect, it } from 'vitest'
import { getMarketAddressesByAssetsType, getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { MarketAssetsType } from '@evm-ui/types/market'

describe('market asset categories', () => {
  it('includes correlated controllers in the category filter', () => {
    const controller = '0x2fb54c8eae57767A9A509A395b9C4FA0702e2675'
    expect(getMarketAssetsType(1, controller)).toBe(MarketAssetsType.Correlated)
    expect(getMarketAddressesByAssetsType(MarketAssetsType.Correlated)).toContain(controller)
  })

  it('keeps the long-tail classification', () => {
    expect(getMarketAssetsType(1, '0xFd85e847cDd2549f213E276e4B57B0690169F043')).toBe(MarketAssetsType.LongTail)
  })

  it('maps established markets to blue-chip', () => {
    const controller = '0x5756A035F276a8095A922931F224F4ed06149608'
    expect(getMarketAssetsType(1, controller)).toBe(MarketAssetsType.BlueChip)
  })
})
