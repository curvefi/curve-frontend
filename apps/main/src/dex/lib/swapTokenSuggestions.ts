import { ethAddress } from 'viem'
import type { NetworkConfig } from '@/dex/types/main.types'

type NativeToken = {
  address: string
  wrappedAddress: string
}

// This list is intended to be refreshed periodically (for example daily) from analytics.
// We keep it local so swap landing does not depend on runtime volume API responses.
const PREDEFINED_SWAP_SUGGESTIONS: Record<number, string[]> = {
  1: [
    ethAddress,
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e', // crvUSD
    '0xd533a949740bb3306d119cc777fa900ba034cd52', // CRV
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH
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

  const addresses = [...(PREDEFINED_SWAP_SUGGESTIONS[chainId] ?? []), ...dynamicSuggestions]
    .filter((address): address is string => !!address)
    .map((address) => address.toLowerCase())

  return Array.from(new Set(addresses))
}

export function toSuggestionRankMap(addresses: string[]) {
  return Object.fromEntries(addresses.map((address, index) => [address, addresses.length - index]))
}
