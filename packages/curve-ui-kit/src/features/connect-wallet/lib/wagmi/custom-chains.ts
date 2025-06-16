import { chainConfig } from 'viem/op-stack'
import { defineChain } from 'viem/utils'
import { Chain as ChainId } from '@ui-kit/utils/network'
import { mainnet } from '@wagmi/core/chains'
import { RPC } from './rpc'

/**
 * WalletConnect ignores the configured HTTP transport URLs from Wagmi config
 * and instead creates a provider using only the first URL from chain.rpcUrls.default.http.
 *
 * This is why we need to define custom chains with specific RPC URLs that will work
 * properly when WalletConnect initializes its provider with:
 * `new WalletConnectProvider({ rpc: chain.rpcUrls.default.http[0] })`
 */
export const ethereum = defineChain({
  ...mainnet,
  rpcUrls: {
    default: { http: RPC[ChainId.Ethereum] },
    public: { http: RPC[ChainId.Ethereum] },
  },
})

export const hyperliquid = defineChain({
  ...chainConfig,
  id: ChainId.Hyperliquid as const,
  name: 'hyperliquid',
  testnet: false,
  nativeCurrency: { name: 'Hype', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.Hyperliquid] } },
  blockExplorers: { default: { name: 'Hyperscan', url: 'https://www.hyperscan.com/' } },
})

export const tac = defineChain({
  ...chainConfig,
  id: ChainId.Tac as const,
  name: 'tac',
  testnet: true,
  nativeCurrency: { name: 'tac', symbol: 'TAC', decimals: 8 },
  rpcUrls: { default: { http: RPC[ChainId.Tac] } },
  blockExplorers: { default: { name: 'Turin Explorer', url: 'https://turin.explorer.tac.build/' } },
})

export const megaeth = defineChain({
  ...chainConfig,
  id: ChainId.MegaEth as const,
  name: 'MEGA Testnet',
  testnet: true,
  nativeCurrency: mainnet.nativeCurrency,
  rpcUrls: { default: { http: RPC[ChainId.MegaEth] } },
  blockExplorers: { default: { name: 'Mega Explorer', url: 'https://www.megaexplorer.xyz/' } },
})

export const strata = defineChain({
  ...chainConfig,
  id: ChainId.Strata as const,
  name: 'Strata',
  testnet: true,
  nativeCurrency: { name: 'BTC', symbol: 'BTC', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.Strata] } },
  blockExplorers: {
    default: { name: 'Strata Explorer', url: 'https://blockscoutb86fae58ae.devnet-annapurna.stratabtc.org/' },
  },
})

export const expchain = defineChain({
  ...chainConfig,
  id: ChainId.ExpChain as const,
  name: 'EXPchain',
  testnet: true,
  nativeCurrency: { name: 'tZKJ', symbol: 'tZKJ', decimals: 18 },
  rpcUrls: { default: { http: RPC[ChainId.ExpChain] } },
  blockExplorers: { default: { name: 'BlockScout', url: 'https://blockscout-testnet.expchain.ai/' } },
})
