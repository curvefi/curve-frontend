import { type Address, zeroAddress } from 'viem'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

/**
 * Gets a Llama market (either a mint or lend market) by its ID.
 * Throws an error if no market is found with the given ID.
 */
export const getLlamaMarket = (id: string, lib = requireLib('llamaApi')): LlamaMarketTemplate =>
  id.startsWith('one-way') ? lib.getLendMarket(id) : lib.getMintMarket(id)

/**
 * Checks if a market supports leverage or not. A market supports leverage if:
 * - Lend Market and its `leverage` property has leverage
 * - Mint Market and either its `leverageZap` is not the zero address or its `leverageV2` property has leverage
 */
export const hasLeverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate
    ? market.leverage.hasLeverage()
    : market.leverageZap !== zeroAddress || market.leverageV2.hasLeverage()

export const getTokens = (market: LlamaMarketTemplate) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
          decimals: market.collateralDecimals,
        },
        borrowToken: {
          symbol: 'crvUSD',
          address: CRVUSD_ADDRESS,
          decimals: 18,
        },
      }
    : {
        collateralToken: {
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
        },
      }

/**
 * Calculates the loan-to-value ratio of a market.
 * @param debt - The amount of debt in the market.
 * @param collateralValue - The value of the collateral in the market. Collateral includes depositted collateral and collateral that has been converted into borrow token in soft-liquidation.
 * @returns The loan-to-value ratio of the market.
 */
export const calculateLtv = (debt: number, collateralValue: number) => {
  if (collateralValue === 0 || debt === 0) return 0
  return (debt / collateralValue) * 100
}
