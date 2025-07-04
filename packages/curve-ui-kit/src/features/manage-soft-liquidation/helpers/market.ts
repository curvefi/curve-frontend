import type { Address } from '@ui-kit/utils'
import type { Market } from '../types'

/**
 * Extracts token information from a market template
 * @param market - The market template
 * @returns Object containing stablecoin and collateral token details with symbol, address, and decimals
 */
export function getTokens(market: Market) {
  const [stablecoinSymbol, collateralSymbol] = 'coins' in market ? market.coins : [market.borrowed_token.symbol]
  const [stablecoinAddress, collateralAddress] = market?.coinAddresses ?? [undefined, undefined]
  const [stablecoinDecimals, collateralDecimals] = market?.coinDecimals ?? [undefined, undefined]

  return {
    stablecoin: {
      symbol: stablecoinSymbol,
      address: stablecoinAddress as Address,
      decimals: stablecoinDecimals,
    },
    collateral: {
      symbol: collateralSymbol,
      address: collateralAddress as Address,
      decimals: collateralDecimals,
    },
  }
}
