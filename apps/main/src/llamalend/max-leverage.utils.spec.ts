import { describe, expect, it } from 'vitest'
import { getMaxPositionLeverage } from './max-leverage.utils'

describe('market maximum leverage', () => {
  it('uses collateral exposure over equity at Max LTV', () => {
    expect(getMaxPositionLeverage({ leverage: 4.8, maxLtv: 80 })).toBe(5)
  })

  it('leaves unsupported or invalid markets unavailable', () => {
    expect(getMaxPositionLeverage({ leverage: null, maxLtv: 80 })).toBeUndefined()
    expect(getMaxPositionLeverage({ leverage: 0, maxLtv: 80 })).toBeUndefined()
    expect(getMaxPositionLeverage({ leverage: 5, maxLtv: 100 })).toBeUndefined()
  })
})
