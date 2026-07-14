import { describe, expect, it } from 'vitest'
import { formatToken } from './tokens'

describe('token formatters', () => {
  it('formats compact token amounts', () => {
    expect(formatToken(1234.56, 'CRV')).toBe('1.23k CRV')
  })

  it('formats regular token amounts', () => {
    expect(formatToken(1234.56, 'crvUSD', 'amount')).toBe('1,234.56 crvUSD')
  })

  it('formats token balances', () => {
    expect(formatToken(0.00000123456789, 'ETH', 'balance')).toBe('0.0000012346 ETH')
  })
})
