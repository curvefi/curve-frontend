import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { Address } from '@ui-kit/utils'

export type Token = {
  address: Address
  symbol: string
  chain?: string
}

export type Market = MintMarketTemplate | LendMarketTemplate

/**
 * The types below are based on the types defined in lend.types.ts and loan.types.ts
 * but cannot be imported directly as they reside in the app packages.
 *
 * To maintain clean architecture, we don't want the app package types
 * to depend on these feature-specific types either.
 *
 * While a mapper from app types to feature types could be implemented, for now
 * it's sufficient to manually mirror the necessary types. This allows app objects
 * to be used directly within the feature without additional transformation.
 */

export type LoanParameters = {
  future_rate?: string
  rate: string
}

export type UserLoanDetails = {
  /** User health in percent. There's a few different health values but this is the most important one. (Don't ask me why) */
  healthFull: string
}

export type UserState = {
  /** User's collateral token balance */
  collateral: string
  /** User's stablecoin balance */
  stablecoin: string
  /** User's outstanding debt in stablecoins */
  debt: string
}

export type UserBalances = {
  /** Available stablecoin balance in wallet */
  stablecoin: string
}
