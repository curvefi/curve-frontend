/**
 * WalletConnect ignores the configured HTTP transport URLs from Wagmi config
 * and instead creates a provider using only the first URL from chain.rpcUrls.default.http.
 *
 * This is why we need to define custom chains with specific RPC URLs that will work
 * properly when WalletConnect initializes its provider with:
 * `new WalletConnectProvider({ rpc: chain.rpcUrls.default.http[0] })`
 *
 * blockExplorers are not defined here, they get set in `createChain`.
 */
import { chainConfig } from 'viem/op-stack'
import { defineChain } from 'viem/utils'
import { Chain as ChainId } from '@ui-kit/utils/network'
import { mainnet } from '@wagmi/core/chains'
import { RPC } from './rpc'

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
})

export const tac = defineChain({
  ...chainConfig,
  id: ChainId.Tac as const,
  name: 'tac',
  testnet: true,
  nativeCurrency: { name: 'tac', symbol: 'TAC', decimals: 8 },
  rpcUrls: { default: { http: RPC[ChainId.Tac] } },
})

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
