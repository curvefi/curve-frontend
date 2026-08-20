import type { Address } from '@primitives/address.utils'

export const LZ_CHAIN = {
  Ethereum: 1,
  Bsc: 56,
  Avalanche: 43114,
  Fantom: 250,
  Sonic: 146,
  Xdc: 50,
  Etherlink: 42793,
} as const
export const LAYERZERO_CHAINS = Object.values(LZ_CHAIN)

export type LayerZeroToken = 'CRV' | 'crvUSD' | 'scrvUSD'
export type BridgeProvider = 'fastbridge' | 'layerzero'

export const BRIDGE_TOKENS = ['CRV', 'crvUSD', 'scrvUSD'] as const satisfies readonly LayerZeroToken[]
export const FASTBRIDGE_CHAINS = [42161, 10, 252] as const
export const BRIDGE_CHAINS = [...LAYERZERO_CHAINS, ...FASTBRIDGE_CHAINS] as const

export const getBridgeDestinationChainIds = (fromChainId: number): readonly number[] =>
  fromChainId === LZ_CHAIN.Ethereum
    ? LAYERZERO_CHAINS.filter(chainId => chainId !== LZ_CHAIN.Ethereum)
    : BRIDGE_CHAINS.includes(fromChainId as (typeof BRIDGE_CHAINS)[number])
      ? [LZ_CHAIN.Ethereum]
      : []

export const LAYERZERO_TOKENS: Record<LayerZeroToken, Address> = {
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
  scrvUSD: '0x0655977FEb2f289A4aB78af67BAB0d17aAb84367',
}

export type LayerZeroBridgeFamily = 'crv' | 'stable'
export type LayerZeroDeployment = {
  bridgeAddress: Address
  tokenAddress: Address
  family: LayerZeroBridgeFamily
}

const routes: Partial<Record<number, Partial<Record<LayerZeroToken, LayerZeroDeployment>>>> = {
  [LZ_CHAIN.Bsc]: {
    CRV: {
      bridgeAddress: '0xC91113B4Dd89dd20FDEECDAC82477Bc99A840355',
      tokenAddress: '0x9996D0276612d23b35f90C51EE935520B3d7355B',
      family: 'crv',
    },
    crvUSD: {
      bridgeAddress: '0x0A92Fd5271dB1C41564BD01ef6b1a75fC1db4d4f',
      tokenAddress: '0xe2fb3F127f5450DeE44afe054385d74C392BdeF4',
      family: 'stable',
    },
    scrvUSD: {
      bridgeAddress: '0xAE0666C978500f2C05784242B79B08C478Dd999c',
      tokenAddress: '0x0094Ad026643994c8fB2136ec912D508B15fe0E5',
      family: 'stable',
    },
  },
  [LZ_CHAIN.Avalanche]: {
    CRV: {
      bridgeAddress: '0x5cc0144A511807608eF644c9e99B486124D1cFd6',
      tokenAddress: '0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B',
      family: 'crv',
    },
    crvUSD: {
      bridgeAddress: '0x26D01ce989037befd7Ff63837A86e2da32E7D7e2',
      tokenAddress: '0xCb7c161602d04C4e8aF1832046EE08AAF96d855D',
      family: 'stable',
    },
    scrvUSD: {
      bridgeAddress: '0x26E91B1f142b9bF0bB37e82959bA79D2Aa6b99b8',
      tokenAddress: '0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64',
      family: 'stable',
    },
  },
  [LZ_CHAIN.Fantom]: {
    CRV: {
      bridgeAddress: '0x7ce8aF75A9180B602445bE230860DDcb4cAc3E42',
      tokenAddress: '0xE6c259bc0FCE25b71fE95A00361D3878E16232C3',
      family: 'crv',
    },
    crvUSD: {
      bridgeAddress: '0x76EAfda658C54548B460B3f190386699DE3827d8',
      tokenAddress: '0xD823D2a2B5AF77835e972A0D5B77f5F5A9a003A6',
      family: 'stable',
    },
    scrvUSD: {
      bridgeAddress: '0x08132eA9b02750E118cF5F5C640B7c46A8E638E8',
      tokenAddress: '0x5191946500e75f0A74476F146dF7d386e52961d9',
      family: 'stable',
    },
  },
  [LZ_CHAIN.Sonic]: {
    CRV: {
      bridgeAddress: '0x5A537a46D780B1C70138aB98eDce69e7a53177ba',
      tokenAddress: '0x5Af79133999f7908953E94b7A5CF367740Ebee35',
      family: 'crv',
    },
  },
  [LZ_CHAIN.Xdc]: {
    scrvUSD: {
      bridgeAddress: '0x1Ae4Ab5274a96B75d6f55a696c9D550D218261b0',
      tokenAddress: '0x3d8EADb739D1Ef95dd53D718e4810721837c69c1',
      family: 'stable',
    },
  },
  [LZ_CHAIN.Etherlink]: {
    CRV: {
      bridgeAddress: '0xFF0871601158e506338967aB8C19fB59d8d5cAB2',
      tokenAddress: '0x004A476B5B76738E34c86C7144554B9d34402F13',
      family: 'crv',
    },
    crvUSD: {
      bridgeAddress: '0xE9670C9B8bd3e2824aECaAB346B1B4392e0c26b3',
      tokenAddress: '0x0094Ad026643994c8fB2136ec912D508B15fe0E5',
      family: 'stable',
    },
    scrvUSD: {
      bridgeAddress: '0x2E16150df237F938cc70730895dE33eb45594419',
      tokenAddress: '0xe35A879E5EfB4F1Bb7F70dCF3250f2e19f096bd8',
      family: 'stable',
    },
  },
}

const scanStartBlock: Record<number, bigint> = {
  [LZ_CHAIN.Ethereum]: 18_999_547n,
  [LZ_CHAIN.Bsc]: 35_214_890n,
  [LZ_CHAIN.Avalanche]: 40_319_544n,
  [LZ_CHAIN.Fantom]: 70_000_000n,
  [LZ_CHAIN.Sonic]: 1_582_999n,
  [LZ_CHAIN.Xdc]: 90_846_163n,
  [LZ_CHAIN.Etherlink]: 22_196_510n,
}

export type LayerZeroClaimDeployment = LayerZeroDeployment & {
  chainId: number
  originChainId: number
  startBlock: bigint
  token: LayerZeroToken
}

export const LAYERZERO_CLAIM_DEPLOYMENTS: LayerZeroClaimDeployment[] = Object.entries(routes).flatMap(
  ([sidechainId, deployments]) =>
    Object.entries(deployments ?? {}).flatMap(([token, deployment]) => {
      if (!deployment) return []
      const chainId = Number(sidechainId)
      const typedToken = token as LayerZeroToken
      return [
        ...(chainId === LZ_CHAIN.Fantom && typedToken === 'CRV'
          ? []
          : [
              {
                ...deployment,
                chainId,
                originChainId: LZ_CHAIN.Ethereum,
                startBlock: scanStartBlock[chainId],
                token: typedToken,
              },
            ]),
        {
          ...deployment,
          chainId: LZ_CHAIN.Ethereum,
          originChainId: chainId,
          startBlock: scanStartBlock[LZ_CHAIN.Ethereum],
          token: typedToken,
          tokenAddress: LAYERZERO_TOKENS[typedToken],
        },
      ]
    }),
)

export const getLayerZeroRoute = ({
  fromChainId,
  toChainId,
  token,
}: {
  fromChainId: number
  toChainId: number
  token: LayerZeroToken
}) => {
  if (fromChainId === toChainId || (fromChainId !== LZ_CHAIN.Ethereum && toChainId !== LZ_CHAIN.Ethereum))
    return undefined
  if (fromChainId === LZ_CHAIN.Ethereum && toChainId === LZ_CHAIN.Fantom && token === 'CRV') return undefined

  const sidechain = fromChainId === LZ_CHAIN.Ethereum ? toChainId : fromChainId
  const deployment = routes[sidechain]?.[token]
  if (!deployment) return undefined

  return {
    tokenAddress: fromChainId === LZ_CHAIN.Ethereum ? LAYERZERO_TOKENS[token] : deployment.tokenAddress,
    bridgeAddress: deployment.bridgeAddress,
    amountFirst: token !== 'CRV',
    family: deployment.family,
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

export const layerZeroCrvCapacityAbi = [
  ...layerZeroStatusAbi,
  { type: 'function', name: 'available', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'limit', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'period', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export const layerZeroStableCapacityAbi = [
  ...layerZeroStatusAbi,
  { type: 'function', name: 'limit', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'issued',
    stateMutability: 'view',
    inputs: [{ type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  { type: 'function', name: 'delay', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
] as const

export const layerZeroRetryAbi = [
  {
    type: 'event',
    name: 'Delayed',
    inputs: [
      { name: 'nonce', type: 'uint64', indexed: true },
      { name: 'receiver', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'delayed',
    stateMutability: 'view',
    inputs: [{ type: 'uint64' }],
    outputs: [{ type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'retry',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'uint64' }, { type: 'uint256' }, { type: 'address' }, { type: 'uint256' }],
    outputs: [],
  },
] as const
