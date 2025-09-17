import { type Address, zeroAddress } from 'viem'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { assert, CRVUSD_ADDRESS } from '@ui-kit/utils'

/**
 * Gets a Llama market (either a mint or lend market) by its ID.
 * Throws an error if no market is found with the given ID.
 */
export const getLlamaMarket = (id: string, lib = requireLib('llamaApi')): LlamaMarketTemplate =>
  assert(lib.getMintMarket(id) ?? lib.getLendMarket(id), `Market with ID ${id} not found`)

/**
 * Checks if a market supports leverage or not. A market supports leverage if:
 * - Lend Market and its `leverage` property has leverage
 * - Mint Market and either its `leverageZap` is not the zero address or its `leverageV2` property has leverage
 */
export const hasLeverage = (market: LlamaMarketTemplate) =>
  market instanceof LendMarketTemplate
    ? market.leverage.hasLeverage()
    : market.leverageZap !== zeroAddress || market.leverageV2.hasLeverage()

export const getTokens = (market: LlamaMarketTemplate, chain: INetworkName) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          chain,
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
          decimals: market.collateralDecimals,
        },
        borrowToken: {
          chain,
          symbol: 'crvUSD',
          address: CRVUSD_ADDRESS,
          decimals: 18,
        },
      }
    : {
        collateralToken: {
          chain,
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          chain,
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
        },
      }
