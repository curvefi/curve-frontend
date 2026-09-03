import { chainConfig } from 'viem/op-stack'
import { defineChain } from 'viem/utils'
import { Chain as ChainId } from '@evm-ui/utils/network'
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
