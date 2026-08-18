import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { getLayerZeroRoute as GetLayerZeroRoute } from './layerzero'

vi.stubGlobal('window', {})

let getLayerZeroRoute: typeof GetLayerZeroRoute

beforeAll(async () => {
  ;({ getLayerZeroRoute } = await import('./layerzero'))
})

const chains = { ethereum: 1, bsc: 56, avalanche: 43114, fantom: 250, arbitrum: 42161 } as const

describe('getLayerZeroRoute', () => {
  it('resolves all supported Ethereum and sidechain directions', () => {
    for (const token of ['CRV', 'crvUSD', 'scrvUSD'] as const) {
      for (const sidechain of [chains.bsc, chains.avalanche, chains.fantom]) {
        expect(getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: sidechain, token })).toBeDefined()
        expect(getLayerZeroRoute({ fromChainId: sidechain, toChainId: chains.ethereum, token })).toBeDefined()
      }
    }
  })

  it('rejects same-chain, sidechain-to-sidechain, and unsupported routes', () => {
    expect(
      getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: chains.ethereum, token: 'CRV' }),
    ).toBeUndefined()
    expect(getLayerZeroRoute({ fromChainId: chains.bsc, toChainId: chains.avalanche, token: 'CRV' })).toBeUndefined()
    expect(
      getLayerZeroRoute({ fromChainId: chains.arbitrum, toChainId: chains.ethereum, token: 'CRV' }),
    ).toBeUndefined()
  })

  it('selects the deployed ABI family by token', () => {
    expect(getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: chains.bsc, token: 'CRV' })?.amountFirst).toBe(
      false,
    )
    expect(
      getLayerZeroRoute({ fromChainId: chains.bsc, toChainId: chains.ethereum, token: 'crvUSD' })?.amountFirst,
    ).toBe(true)
    expect(
      getLayerZeroRoute({ fromChainId: chains.bsc, toChainId: chains.ethereum, token: 'scrvUSD' })?.amountFirst,
    ).toBe(true)
  })
})
