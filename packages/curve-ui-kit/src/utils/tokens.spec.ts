import { describe, expect, it } from 'vitest'
import { formatTokenAmount, formatTokenBalance, formatTokenCompact } from './tokens'

describe('token formatters', () => {
  it('formats compact token amounts', () => {
    expect(formatTokenCompact(1234.56, 'CRV')).toBe('1.23k CRV')
  })

  it('formats regular token amounts', () => {
    expect(formatTokenAmount(1234.56, 'crvUSD')).toBe('1,234.56 crvUSD')
  })

  it('formats token balances', () => {
    expect(formatTokenBalance(0.00000123456789, 'ETH')).toBe('0.0000012346 ETH')
  })
})
