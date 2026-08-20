import type { Address } from '@primitives/address.utils'
const LZ_CHAIN = { Ethereum: 1, Bsc: 56, Avalanche: 43114, Fantom: 250 } as const
export const LAYERZERO_CHAINS = [LZ_CHAIN.Ethereum, LZ_CHAIN.Bsc, LZ_CHAIN.Avalanche, LZ_CHAIN.Fantom] as const
export const isLayerZeroChain = (chainId: number): chainId is (typeof LAYERZERO_CHAINS)[number] =>
  LAYERZERO_CHAINS.some(supportedChainId => supportedChainId === chainId)

export type LayerZeroToken = 'CRV' | 'crvUSD' | 'scrvUSD'
export type BridgeProvider = 'fastbridge' | 'layerzero'

export const BRIDGE_TOKENS = ['CRV', 'crvUSD', 'scrvUSD'] as const satisfies readonly LayerZeroToken[]
export const FASTBRIDGE_CHAINS = [42161, 10, 252] as const
export const BRIDGE_CHAINS = [...LAYERZERO_CHAINS, ...FASTBRIDGE_CHAINS] as const

export const getBridgeDestinationChainIds = (fromChainId: number): readonly number[] =>
  fromChainId === LZ_CHAIN.Ethereum
    ? [LZ_CHAIN.Bsc, LZ_CHAIN.Avalanche, LZ_CHAIN.Fantom]
    : BRIDGE_CHAINS.includes(fromChainId as (typeof BRIDGE_CHAINS)[number])
      ? [LZ_CHAIN.Ethereum]
      : []

type TokenAddresses = Record<(typeof LAYERZERO_CHAINS)[number], Address>

export const LAYERZERO_TOKENS: Record<LayerZeroToken, TokenAddresses> = {
  CRV: {
    [LZ_CHAIN.Ethereum]: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    [LZ_CHAIN.Bsc]: '0x9996D0276612d23b35f90C51EE935520B3d7355B',
    [LZ_CHAIN.Avalanche]: '0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B',
    [LZ_CHAIN.Fantom]: '0xE6c259bc0FCE25b71fE95A00361D3878E16232C3',
  },
  crvUSD: {
    [LZ_CHAIN.Ethereum]: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    [LZ_CHAIN.Bsc]: '0xe2fb3F127f5450DeE44afe054385d74C392BdeF4',
    [LZ_CHAIN.Avalanche]: '0xCb7c161602d04C4e8aF1832046EE08AAF96d855D',
    [LZ_CHAIN.Fantom]: '0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6',
  },
  scrvUSD: {
    [LZ_CHAIN.Ethereum]: '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367',
    [LZ_CHAIN.Bsc]: '0x0094Ad026643994c8fB2136ec912D508B15fe0E5',
    [LZ_CHAIN.Avalanche]: '0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64',
    [LZ_CHAIN.Fantom]: '0x5191946500e75f0A74476F146dF7d386e52961d9',
  },
}

const bridges: Record<LayerZeroToken, Record<Exclude<(typeof LAYERZERO_CHAINS)[number], 1>, Address>> = {
  CRV: {
    [LZ_CHAIN.Bsc]: '0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355',
    [LZ_CHAIN.Avalanche]: '0x5cc0144A511807608eF644c9e99B486124D1cFd6',
    [LZ_CHAIN.Fantom]: '0x7ce8aF75A9180B602445bE230860DDcb4cAc3E42',
  },
  crvUSD: {
    [LZ_CHAIN.Bsc]: '0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f',
    [LZ_CHAIN.Avalanche]: '0x26D01ce989037befd7Ff63837A86e2da32E7D7e2',
    [LZ_CHAIN.Fantom]: '0x76EAfda658C54548B460B3f190386699DE3827d8',
  },
  scrvUSD: {
    [LZ_CHAIN.Bsc]: '0xAE0666C978500f2C05784242B79B08C478Dd999c',
    [LZ_CHAIN.Avalanche]: '0x26E91B1f142b9bF0bB37e82959bA79D2Aa6b99b8',
    [LZ_CHAIN.Fantom]: '0x08132eA9b02750E118cF5F5C640B7c46A8E638E8',
  },
}

export const getLayerZeroRoute = ({
  fromChainId,
  toChainId,
  token,
}: {
  fromChainId: number
  toChainId: number
  token: LayerZeroToken
}) => {
  if (!isLayerZeroChain(fromChainId) || !isLayerZeroChain(toChainId)) return undefined
  if (fromChainId === toChainId || (fromChainId !== LZ_CHAIN.Ethereum && toChainId !== LZ_CHAIN.Ethereum))
    return undefined

  const sidechain = (fromChainId === LZ_CHAIN.Ethereum ? toChainId : fromChainId) as Exclude<
    (typeof LAYERZERO_CHAINS)[number],
    1
  >

  return {
    tokenAddress: LAYERZERO_TOKENS[token][fromChainId],
    bridgeAddress: bridges[token][sidechain],
    amountFirst: token !== 'CRV',
  }
}

export const getBridgeRoute = (params: { fromChainId: number; toChainId: number; token: LayerZeroToken }) => {
  const layerZeroRoute = getLayerZeroRoute(params)
  if (layerZeroRoute) return { provider: 'layerzero', ...layerZeroRoute } as const

  return params.token === 'crvUSD' &&
    params.toChainId === LZ_CHAIN.Ethereum &&
    FASTBRIDGE_CHAINS.includes(params.fromChainId as (typeof FASTBRIDGE_CHAINS)[number])
    ? ({ provider: 'fastbridge' } as const)
    : undefined
}

const quote = {
  type: 'function',
  name: 'quote',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ type: 'uint256' }],
} as const

export const layerZeroAmountFirstAbi = [
  quote,
  {
    type: 'function',
    name: 'bridge',
    stateMutability: 'payable',
    inputs: [
      { name: '_amount', type: 'uint256' },
      { name: '_receiver', type: 'address' },
      { name: '_refund_address', type: 'address' },
    ],
    outputs: [],
  },
] as const

export const layerZeroReceiverFirstAbi = [
  quote,
  {
    type: 'function',
    name: 'bridge',
    stateMutability: 'payable',
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_amount', type: 'uint256' },
      { name: '_refund', type: 'address' },
    ],
    outputs: [],
  },
] as const

export const layerZeroStatusAbi = [
  quote,
  {
    type: 'function',
    name: 'is_killed',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
] as const
