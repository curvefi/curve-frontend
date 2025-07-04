import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Address } from '@ui-kit/utils'
import type { Market } from '../types'

/** Type guard to check if a market is a MintMarketTemplate */
export function isMintMarket(market: Market): market is MintMarketTemplate {
  return 'coins' in market
}

/** Type guard to check if a market is a LendMarketTemplate */
export function isLendMarket(market: Market): market is LendMarketTemplate {
  return 'borrowed_token' in market
}

/**
 * Extracts token information from a market template
 * @param market - The market template
 * @returns Object containing stablecoin and collateral token details with symbol, address, and decimals
 */
export function getTokens(market: Market) {
  const [stablecoinSymbol, collateralSymbol] = isMintMarket(market) ? market.coins : [market.borrowed_token.symbol]
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
