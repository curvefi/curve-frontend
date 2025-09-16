import type { SetValueConfig } from 'react-hook-form'
import type { Address } from 'viem'
import { zeroAddress } from 'viem'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { assert, CRVUSD_ADDRESS } from '@ui-kit/utils'
import { LlamaMarketTemplate } from './borrow.types'
import { BorrowPreset } from './borrow.types'

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

/**
 * Predefined borrow preset ranges in percentage (previously N in the UI)
 */
export const BORROW_PRESET_RANGES = {
  [BorrowPreset.Safe]: 50,
  [BorrowPreset.MaxLtv]: 4,
  [BorrowPreset.Custom]: 10,
}

/**
 * Options to pass to react-hook-form's setValue to trigger validation, dirty and touch states.
 */
export const setValueOptions: SetValueConfig = { shouldValidate: true, shouldDirty: true, shouldTouch: true }

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
