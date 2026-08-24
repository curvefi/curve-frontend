import { describe, expect, it } from 'vitest'
import { getLayerZeroCapacityAvailable, isLayerZeroCapacityExceeded } from './layerzero-capacity'

describe('LayerZero destination capacity', () => {
  it('uses the currently available CRV capacity', () => {
    expect(getLayerZeroCapacityAvailable({ family: 'crv', available: 4n })).toBe(4n)
  })

  it('subtracts issued stablecoins from the daily limit without underflowing', () => {
    expect(getLayerZeroCapacityAvailable({ family: 'stable', issued: 5n, limit: 10n })).toBe(5n)
    expect(getLayerZeroCapacityAvailable({ family: 'stable', issued: 10n, limit: 10n })).toBe(0n)
    expect(getLayerZeroCapacityAvailable({ family: 'stable', issued: 11n, limit: 10n })).toBe(0n)
  })

  it('accepts the exact available capacity and rejects amounts above it', () => {
    expect(isLayerZeroCapacityExceeded(5n, 5n)).toBe(false)
    expect(isLayerZeroCapacityExceeded(6n, 5n)).toBe(true)
  })
})
