import { type Address, zeroAddress } from 'viem'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { INetworkName as LlamaNetworkId, INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Chain } from '@curvefi/prices-api'
import { getUserMarketCollateralEvents as getMintUserMarketCollateralEvents } from '@curvefi/prices-api/crvusd'
import { getUserMarketCollateralEvents as getLendUserMarketCollateralEvents } from '@curvefi/prices-api/lending'
import type { BaseConfig } from '@ui/utils'
import { requireLib, type Wallet } from '@ui-kit/features/connect-wallet'
import { CRVUSD } from '@ui-kit/utils'

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

export const getTokens = (market: LlamaMarketTemplate, chain: INetworkName) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
          decimals: market.collateralDecimals,
          chain,
        },
        borrowToken: CRVUSD,
      }
    : {
        collateralToken: {
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
          chain,
        },
        borrowToken: {
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
          chain,
        },
      }

/**
 * Calculates the loan-to-value ratio of a market.
 * @param debtAmount - The amount of debt in the market.
 * @param collateralAmount - The amount of deposited collateral.
 * @param collateralBorrowTokenAmount - The amount of collateral that has been converted into the borrow token during soft-liquidation.
 * @param borrowTokenUsdRate - The USD rate of the borrow token.
 * @param collateralTokenUsdRate - The USD rate of the collateral token.
 * @returns The loan-to-value ratio of the market.
 */
export const calculateLtv = (
  debtAmount: number,
  collateralAmount: number,
  collateralBorrowTokenAmount: number,
  borrowTokenUsdRate: number | undefined,
  collateralTokenUsdRate: number | undefined,
) => {
  const collateralValue =
    collateralAmount * (collateralTokenUsdRate ?? 0) + collateralBorrowTokenAmount * (borrowTokenUsdRate ?? 0)
  const debtValue = debtAmount * (borrowTokenUsdRate ?? 0)
  if (collateralValue === 0 || debtValue === 0) return 0
  return (debtValue / collateralValue) * 100
}

/**
 * Sends a new transaction hash to the backend to update user events.
 * Note that the backend data will not be directly updated, but this will trigger a background refresh.
 * Therefore, we don't invalidate the `userLendCollateralEvents` query immediately after calling this function.
 */
export const updateUserEventsApi = (
  wallet: Wallet,
  { id: networkId }: BaseConfig<LlamaNetworkId>,
  market: LlamaMarketTemplate,
  txHash: string,
) => {
  const [address, updateEvents] =
    market instanceof LendMarketTemplate
      ? [market.addresses.controller, getLendUserMarketCollateralEvents]
      : [market.controller, getMintUserMarketCollateralEvents]
  void updateEvents(wallet.account.address, networkId as Chain, address as Address, txHash as `0x${string}`)
}
