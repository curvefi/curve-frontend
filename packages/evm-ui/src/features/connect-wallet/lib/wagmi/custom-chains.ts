import { chainConfig } from 'viem/op-stack'
import { defineChain } from 'viem/utils'
import { Chain as ChainId } from '@primitives/network.utils'
import { mainnet } from '@wagmi/core/chains'
import { RPC } from './rpc'

export const megaeth = defineChain({
  ...chainConfig,
  id: ChainId.MegaEth as const,
  name: 'MEGA Testnet',
  testnet: true,
  nativeCurrency: mainnet.nativeCurrency,
  rpcUrls: { default: { http: RPC[ChainId.MegaEth] } },
})

export const strata = defineChain({
  ...chainConfig,
  id: ChainId.Strata as const,
  name: 'Strata',
  testnet: true,
  nativeCurrency: { name: 'BTC', symbol: 'BTC', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.Strata] } },
})

export const expchain = defineChain({
  ...chainConfig,
  id: ChainId.ExpChain as const,
  name: 'EXPchain',
  testnet: true,
  nativeCurrency: { name: 'tZKJ', symbol: 'tZKJ', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.ExpChain] } },
})

/** Copy pasted from Viem 2.56.6 which has not yet been published to NPM */
export const arc = defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.Arc] } },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://arc.etherscan.io', apiUrl: 'https://explorer.arc.io/api/v2' },
  },
  contracts: { multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 0 } },
})
