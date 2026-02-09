import { ethAddress } from 'viem'
import type { NetworkConfig } from '@/dex/types/main.types'

type NativeToken = {
  address: string
  wrappedAddress: string
}

type PredefinedSuggestion = {
  address: string
  symbol: string
}

// This list is intended to be refreshed periodically (for example daily) from analytics.
// We keep it local so swap landing does not depend on runtime volume API responses.
const PREDEFINED_SWAP_SUGGESTIONS: Record<number, PredefinedSuggestion[]> = {
  1: [
    { address: ethAddress, symbol: 'ETH' },
    { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC' },
    { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT' },
    { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI' },
    { address: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e', symbol: 'crvUSD' },
    { address: '0xd533a949740bb3306d119cc777fa900ba034cd52', symbol: 'CRV' },
    { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', symbol: 'WBTC' },
    { address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', symbol: 'wstETH' },
  ],
}

export function getSwapSuggestedTokenAddresses({
  chainId,
  network,
  nativeToken,
  cachedFromAddress,
  cachedToAddress,
}: {
  chainId: number
  network: Pick<NetworkConfig, 'swap' | 'createQuickList'> | null
  nativeToken?: NativeToken
  cachedFromAddress?: string
  cachedToAddress?: string
}) {
  const dynamicSuggestions = [
    nativeToken?.address,
    nativeToken?.wrappedAddress,
    network?.swap.fromAddress,
    network?.swap.toAddress,
    cachedFromAddress,
    cachedToAddress,
    ...(network?.createQuickList ?? []).map(({ address }) => address),
  ]

  const addresses = [
    ...(PREDEFINED_SWAP_SUGGESTIONS[chainId] ?? []).map(({ address }) => address),
    ...dynamicSuggestions,
  ]
    .filter((address): address is string => !!address)
    .map((address) => address.toLowerCase())

  return Array.from(new Set(addresses))
}

export function getSwapSuggestedTokenSymbols(chainId: number) {
  return Object.fromEntries(
    (PREDEFINED_SWAP_SUGGESTIONS[chainId] ?? []).map(({ address, symbol }) => [address.toLowerCase(), symbol]),
  )
}

export function toSuggestionRankMap(addresses: string[]) {
  return Object.fromEntries(addresses.map((address, index) => [address, addresses.length - index]))
}
