import { describe, expect, it } from 'vitest'
import { orderSearchTokens } from './search-ordering'
import type { TokenOption } from './types'

const token = (address: `0x${string}`, symbol: string, volume?: number): TokenOption => ({ address, symbol, volume })

describe('orderSearchTokens', () => {
  it('puts owned tokens ahead of higher-volume unowned tokens', () => {
    const owned = token('0xowned', 'OWN', 1)
    const unowned = token('0xunowned', 'HIGH', 1_000)

    expect(orderSearchTokens([unowned, owned], { balances: { [owned.address]: 1 } })).toEqual([[owned], [unowned]])
  })

  it('orders owned tokens by USD value, raw balance, symbol, then address', () => {
    const tokens = [
      token('0x3', 'ZED'),
      token('0x2', 'ALPHA'),
      token('0x1', 'ALPHA'),
      token('0x4', 'VALUE'),
      token('0x5', 'RAW'),
    ]

    expect(
      orderSearchTokens(tokens, {
        balances: { '0x1': 2, '0x2': 2, '0x3': 2, '0x4': 1, '0x5': 3 },
        tokenPrices: { '0x1': 1, '0x2': 1, '0x3': 1, '0x4': 3, '0x5': 0.5 },
      })[0],
    ).toEqual([tokens[3], tokens[2], tokens[1], tokens[0], tokens[4]])
  })

  it('keeps dust and unpriced positive balances in the owned group', () => {
    const dust = token('0xdust', 'DUST')
    const unpriced = token('0xunpriced', 'UNPRICED')
    const unowned = token('0xunowned', 'VOLUME', 100)

    expect(
      orderSearchTokens([unowned, dust, unpriced], { balances: { [dust.address]: 0.0001, [unpriced.address]: 2 } }),
    ).toEqual([[unpriced, dust], [unowned]])
  })

  it('orders remaining tokens by volume, then alphabetically and address for missing values', () => {
    const tokens = [
      token('0x2', 'ALPHA'),
      token('0x1', 'ALPHA'),
      token('0xzed', 'ZED'),
      token('0xhigh', 'HIGH', 2),
      token('0xlow', 'LOW', 1),
    ]

    expect(orderSearchTokens(tokens, {})[1]).toEqual([tokens[3], tokens[4], tokens[1], tokens[0], tokens[2]])
  })

  it('falls back to volume ordering without wallet data and does not duplicate tokens', () => {
    const tokens = [token('0xb', 'B', 1), token('0xa', 'A', 2)]
    const [owned, remaining] = orderSearchTokens(tokens, {})

    expect(owned).toEqual([])
    expect(remaining).toEqual([tokens[1], tokens[0]])
    expect(new Set([...owned, ...remaining])).toHaveLength(tokens.length)
  })
})
