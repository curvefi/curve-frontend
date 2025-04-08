import { chainConfig } from 'viem/op-stack'
import { defineChain } from 'viem/utils'
import { mainnet } from '@wagmi/core/chains'

export const hyperliquid = defineChain({
  ...chainConfig,
  id: 999 as const,
  name: 'hyperliquid',
  testnet: false,
  nativeCurrency: { name: 'Hype', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.hyperliquid.xyz/evm'] } },
  blockExplorers: { default: { name: 'Purrsec', url: 'https://purrsec.com/' } },
})

export const tac = defineChain({
  ...chainConfig,
  id: 2390 as const,
  name: 'tac',
  testnet: true,
  nativeCurrency: { name: 'tac', symbol: 'TAC', decimals: 8 },
  rpcUrls: { default: { http: ['https://turin.rpc.tac.build'] } },
  blockExplorers: { default: { name: 'Turin Explorer', url: 'https://turin.explorer.tac.build/' } },
})

export const megaeth = defineChain({
  ...chainConfig,
  id: 6342 as const,
  name: 'MEGA Testnet',
  testnet: true,
  nativeCurrency: mainnet.nativeCurrency,
  rpcUrls: { default: { http: ['https://carrot.megaeth.com/rpc'] } },
  blockExplorers: { default: { name: 'Mega Explorer', url: 'https://www.megaexplorer.xyz/' } },
})

export const strata = defineChain({
  ...chainConfig,
  id: 8091 as const,
  name: 'Strata',
  testnet: true,
  nativeCurrency: { name: 'BTC', symbol: 'BTC', decimals: 18 },
  rpcUrls: { default: { http: ['https://stratareth3666f0713.devnet-annapurna.stratabtc.org'] } },
  blockExplorers: {
    default: { name: 'Strata Explorer', url: 'https://blockscoutb86fae58ae.devnet-annapurna.stratabtc.org/' },
  },
})

export const expchain = defineChain({
  ...chainConfig,
  id: 18880 as const,
  name: 'EXPchain',
  testnet: true,
  nativeCurrency: { name: 'tZKJ', symbol: 'tZKJ', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc0-testnet.expchain.ai'] } },
  blockExplorers: { default: { name: 'BlockScout', url: 'https://blockscout-testnet.expchain.ai/' } },
})
