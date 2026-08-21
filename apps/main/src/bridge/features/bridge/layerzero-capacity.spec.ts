import { describe, expect, it } from 'vitest'
import { getLayerZeroCapacityResult } from './layerzero-capacity'

describe('LayerZero destination capacity', () => {
  it('partially delays CRV up to the current available capacity', () => {
    expect(
      getLayerZeroCapacityResult('crv', 10n, { family: 'crv', available: 4n, limit: 20n, period: 86_400n }),
    ).toEqual({ immediate: 4n, delayed: 6n, wait: 86_400n })
    expect(
      getLayerZeroCapacityResult('crv', 21n, { family: 'crv', available: 20n, limit: 20n, period: 86_400n }),
    ).toEqual({ immediate: 0n, delayed: 21n, wait: 86_400n })
  })

  it('delays the full stablecoin transfer when the daily remainder is exceeded', () => {
    expect(
      getLayerZeroCapacityResult('stable', 6n, { family: 'stable', issued: 5n, limit: 10n, delay: 3_600n }),
    ).toEqual({ immediate: 0n, delayed: 6n, wait: 3_600n })
  })
})
