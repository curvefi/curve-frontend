import { beforeAll, describe, expect, it, vi } from 'vitest'
import type {
  getBridgeDestinationChainIds as GetBridgeDestinationChainIds,
  getBridgeRoute as GetBridgeRoute,
  getLayerZeroRoute as GetLayerZeroRoute,
} from './layerzero'

vi.stubGlobal('window', {})

let getLayerZeroRoute: typeof GetLayerZeroRoute
let getBridgeRoute: typeof GetBridgeRoute
let getBridgeDestinationChainIds: typeof GetBridgeDestinationChainIds

beforeAll(async () => {
  ;({ getLayerZeroRoute, getBridgeRoute, getBridgeDestinationChainIds } = await import('./layerzero'))
})

const chains = {
  ethereum: 1,
  bsc: 56,
  avalanche: 43114,
  fantom: 250,
  kava: 2222,
  sonic: 146,
  xdc: 50,
  etherlink: 42793,
  arbitrum: 42161,
} as const

describe('bridge route selection', () => {
  it('selects FastBridge and LayerZero without allowing unsupported tokens', () => {
    expect(
      getBridgeRoute({ fromChainId: chains.arbitrum, toChainId: chains.ethereum, token: 'crvUSD' })?.provider,
    ).toBe('fastbridge')
    expect(getBridgeRoute({ fromChainId: chains.ethereum, toChainId: chains.bsc, token: 'CRV' })?.provider).toBe(
      'layerzero',
    )
    expect(getBridgeRoute({ fromChainId: chains.arbitrum, toChainId: chains.ethereum, token: 'CRV' })).toBeUndefined()
  })

  it('limits destinations to valid network pairs', () => {
    expect(getBridgeDestinationChainIds(chains.ethereum)).toEqual([
      chains.bsc,
      chains.avalanche,
      chains.fantom,
      chains.sonic,
      chains.xdc,
      chains.etherlink,
    ])
    expect(getBridgeDestinationChainIds(chains.arbitrum)).toEqual([chains.ethereum])
    expect(getBridgeDestinationChainIds(chains.kava)).toEqual([])
    expect(getBridgeDestinationChainIds(999_999)).toEqual([])
  })
})

describe('getLayerZeroRoute', () => {
  it('resolves the complete bidirectional token matrix', () => {
    const supported = {
      CRV: [chains.bsc, chains.avalanche, chains.sonic, chains.etherlink],
      crvUSD: [chains.bsc, chains.avalanche, chains.fantom, chains.etherlink],
      scrvUSD: [chains.bsc, chains.avalanche, chains.fantom, chains.xdc, chains.etherlink],
    } as const

    for (const token of ['CRV', 'crvUSD', 'scrvUSD'] as const) {
      for (const sidechain of supported[token]) {
        expect(getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: sidechain, token })).toBeDefined()
        expect(getLayerZeroRoute({ fromChainId: sidechain, toChainId: chains.ethereum, token })).toBeDefined()
      }
    }
  })

  it('only allows CRV from Fantom to Ethereum', () => {
    expect(getLayerZeroRoute({ fromChainId: chains.fantom, toChainId: chains.ethereum, token: 'CRV' })).toBeDefined()
    expect(getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: chains.fantom, token: 'CRV' })).toBeUndefined()
  })

  it('rejects same-chain, sidechain-to-sidechain, and unsupported routes', () => {
    expect(
      getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: chains.ethereum, token: 'CRV' }),
    ).toBeUndefined()
    expect(getLayerZeroRoute({ fromChainId: chains.bsc, toChainId: chains.avalanche, token: 'CRV' })).toBeUndefined()
    expect(
      getLayerZeroRoute({ fromChainId: chains.arbitrum, toChainId: chains.ethereum, token: 'CRV' }),
    ).toBeUndefined()
    expect(getLayerZeroRoute({ fromChainId: chains.kava, toChainId: chains.ethereum, token: 'CRV' })).toBeUndefined()
    expect(
      getLayerZeroRoute({ fromChainId: chains.sonic, toChainId: chains.ethereum, token: 'crvUSD' }),
    ).toBeUndefined()
    expect(
      getLayerZeroRoute({ fromChainId: chains.ethereum, toChainId: chains.sonic, token: 'scrvUSD' }),
    ).toBeUndefined()
    expect(getLayerZeroRoute({ fromChainId: chains.xdc, toChainId: chains.ethereum, token: 'CRV' })).toBeUndefined()
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
