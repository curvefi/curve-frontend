import { ethAddress } from 'viem'
import { Chain } from '@curvefi/prices-api'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { useQueries } from '@tanstack/react-query'
import { type DeepKeys } from '@tanstack/table-core'
import { getCampaignOptions, type PoolRewards } from '@ui-kit/entities/campaigns'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { CRVUSD_ROUTES, getInternalUrl, LEND_ROUTES } from '@ui-kit/shared/routes'
import { type ExtraIncentive, LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { type Address } from '@ui-kit/utils'
import { getFavoriteMarketOptions } from './favorite-markets'
import {
  getLendingVaultsOptions,
  getUserLendingSuppliesOptions,
  getUserLendingVaultsOptions,
  LendingVault,
} from './lending-vaults'
import { getMintMarketOptions, getUserMintMarketsOptions, MintMarket } from './mint-markets'

export type Assets = {
  borrowed: AssetDetails
  collateral: AssetDetails
}

export type AssetDetails = {
  symbol: string
  address: Address
  chain: Chain
  balance: number | null
  balanceUsd: number | null
  rebasingYield: number | null
}

export type LlamaMarket = {
  chain: Chain
  address: Address
  controllerAddress: Address
  assets: Assets
  utilizationPercent: number
  liquidityUsd: number
  tvl: number
  totalDebtUsd: number
  totalCollateralUsd: number
  debtCeiling: number | null // only for mint markets, null for lend markets
  rates: {
    lend: number | null // lendApr + CRV unboosted + yield from collateral
    lendApr: number | null // base lend APR %
    lendCrvAprUnboosted: number | null
    lendCrvAprBoosted: number | null
    lendTotalApyMaxBoosted: number | null // supply rate + rebasing yield + total extra incentives + max boosted yield
    borrow: number // base borrow APY %
    borrowTotalApy: number // borrow - yield from collateral
    // extra lending incentives, like OP rewards (so non CRV)
    incentives: ExtraIncentive[]
  }
  type: LlamaMarketType
  url: string
  rewards: PoolRewards[]
  isFavorite: boolean
  leverage: number
  deprecatedMessage?: string
  userHasPositions: Record<MarketRateType, boolean> | null // null means no positions in either market and makes easy to filter
}

export type LlamaMarketsResult = {
  markets: LlamaMarket[]
  userHasPositions: Record<LlamaMarketType, Record<MarketRateType, boolean>> | null
  hasFavorites: boolean
}

export type LlamaMarketKey = DeepKeys<LlamaMarket>

const DEPRECATED_LLAMAS: Record<string, () => string> = {
  '0x136e783846ef68C8Bd00a3369F787dF8d683a696': () =>
    t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
}

const convertLendingVault = (
  {
    controller,
    chain,
    totalAssets,
    totalAssetsUsd,
    totalDebt,
    totalDebtUsd,
    vault,
    collateralToken,
    borrowedToken,
    borrowedBalanceUsd,
    collateralBalanceUsd,
    apyBorrow,
    aprLend: lendApr,
    aprLendCrv0Boost: lendCrvAprUnboosted,
    aprLendCrvMaxBoost: lendCrvAprBoosted,
    leverage,
    extraRewardApr,
  }: LendingVault,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, PoolRewards[]> = {},
  userBorrows: Set<Address>,
  userSupplied: Set<Address>,
): LlamaMarket => {
  const hasBorrowed = userBorrows.has(controller)
  const hasSupplied = userSupplied.has(vault)
  const totalExtraRewardApr = (extraRewardApr ?? []).reduce((acc, x) => acc + x.rate, 0)
  const lend = lendApr + (lendCrvAprUnboosted ?? 0) + (borrowedToken?.rebasingYield ?? 0) + totalExtraRewardApr
  return {
    chain,
    address: vault,
    controllerAddress: controller,
    assets: {
      borrowed: {
        ...borrowedToken,
        chain,
        balance: totalDebt,
        balanceUsd: totalDebtUsd,
      },
      collateral: {
        ...collateralToken,
        chain,
        balance: totalAssets,
        balanceUsd: totalAssetsUsd,
      },
    },
    utilizationPercent: totalAssetsUsd && (100 * totalDebtUsd) / totalAssetsUsd,
    debtCeiling: null, // debt ceiling is not applicable for lend markets
    liquidityUsd: totalAssetsUsd - totalDebtUsd,
    totalDebtUsd: totalDebtUsd,
    totalCollateralUsd: collateralBalanceUsd + borrowedBalanceUsd,
    tvl:
      borrowedBalanceUsd + // collateral converted to crvusd
      collateralBalanceUsd + // collateral
      totalAssetsUsd - // supplied assets
      totalDebtUsd,
    rates: {
      lend, // this is the total yield, including incentive and collateral yield, and is displayed in the table
      lendApr,
      lendCrvAprUnboosted,
      lendCrvAprBoosted,
      lendTotalApyMaxBoosted:
        lendApr + (borrowedToken?.rebasingYield ?? 0) + totalExtraRewardApr + (lendCrvAprBoosted ?? 0),
      borrow: apyBorrow,
      // as confusing as it may be, `borrow` is used in the table, but the total borrow is only in the tooltip
      borrowTotalApy: apyBorrow - (collateralToken?.rebasingYield ?? 0),
      incentives: extraRewardApr
        ? extraRewardApr.map(({ address, symbol, rate }) => ({
            title: symbol,
            percentage: rate,
            address,
            blockchainId: chain,
          }))
        : [],
    },
    type: LlamaMarketType.Lend,
    url: getInternalUrl(
      'lend',
      chain,
      `${LEND_ROUTES.PAGE_MARKETS}/${controller}/${hasBorrowed || hasSupplied ? 'manage' : 'create'}`,
    ),
    isFavorite: favoriteMarkets.has(vault),
    rewards: [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])],
    leverage,
    userHasPositions:
      hasBorrowed || hasSupplied
        ? {
            [MarketRateType.Borrow]: hasBorrowed,
            [MarketRateType.Supply]: hasSupplied,
          }
        : null,
  }
}

/** We show WETH as ETH in the UI and market URL. Also change address so the symbol is correct */
const getCollateral = ({ address, symbol }: { address: Address; symbol: string }): [string, Address] =>
  symbol == 'WETH' ? ['ETH', ethAddress] : [symbol, address]

const convertMintMarket = (
  {
    address,
    collateralToken,
    collateralAmount,
    collateralAmountUsd,
    stablecoinToken,
    llamma,
    rate,
    borrowed,
    borrowedUsd,
    borrowable,
    debtCeiling,
    chain,
  }: MintMarket,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, PoolRewards[]> = {},
  userMintMarkets: Set<Address>,
  collateralIndex: number, // index in the list of markets with the same collateral token, used to create a unique name
): LlamaMarket => {
  const hasBorrow = userMintMarkets.has(address)
  const [collateralSymbol, collateralAddress] = getCollateral(collateralToken)
  const name = collateralIndex > 1 ? `${collateralSymbol}${collateralIndex}` : collateralSymbol
  return {
    chain,
    address: llamma,
    controllerAddress: address,
    assets: {
      borrowed: {
        symbol: stablecoinToken.symbol,
        address: stablecoinToken.address,
        chain,
        balance: borrowed,
        balanceUsd: borrowedUsd,
        rebasingYield: stablecoinToken.rebasingYield ? Number(stablecoinToken.rebasingYield) : null,
      },
      collateral: {
        symbol: collateralSymbol,
        address: collateralAddress,
        chain,
        balance: collateralAmount,
        balanceUsd: collateralAmountUsd,
        rebasingYield: collateralToken.rebasingYield ? Number(collateralToken.rebasingYield) : null,
      },
    },
    utilizationPercent: Math.min(100, (100 * borrowed) / debtCeiling), // debt ceiling may be lowered, so cap at 100%
    debtCeiling,
    liquidityUsd: borrowable,
    tvl: collateralAmountUsd,
    totalDebtUsd: borrowed * stablecoin_price,
    totalCollateralUsd: collateralAmountUsd,
    rates: {
      borrow: rate * 100,
      lend: null,
      lendApr: null,
      lendCrvAprBoosted: null,
      lendCrvAprUnboosted: null,
      lendTotalApyMaxBoosted: null,
      borrowTotalApy: rate * 100,
      incentives: [],
    },
    type: LlamaMarketType.Mint,
    deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
    url: getInternalUrl(
      'crvusd',
      chain,
      `${CRVUSD_ROUTES.PAGE_MARKETS}/${name}/${hasBorrow ? 'manage/loan' : 'create'}`,
    ),
    isFavorite: favoriteMarkets.has(llamma),
    rewards: [...(campaigns[address.toLowerCase()] ?? []), ...(campaigns[llamma.toLowerCase()] ?? [])],
    leverage: 0,
    userHasPositions: hasBorrow ? { [MarketRateType.Borrow]: hasBorrow, [MarketRateType.Supply]: false } : null,
  }
}

/**
 * Creates a function that counts the number of markets for each collateral token.
 * This is used to create unique names for markets with the same collateral token, used in the URL.
 * The order is expected to be by market creation date, so the first market will have count 1, the second 2, etc.
 * The backend is hardcoded to return markets in the order of creation, so this should work correctly.
 * @returns A function that takes a MintMarket and returns the count of markets for the collateral token.
 */
function createCountMarket() {
  const marketCountByCollateral = new Map<string, number>()
  return ({ collateralToken }: MintMarket) => {
    const [symbol] = getCollateral(collateralToken)
    const count = (marketCountByCollateral.get(symbol) ?? 0) + 1
    marketCountByCollateral.set(symbol, count)
    return count
  }
}

/**
 * Query hook combining all lend and mint markets of all chains into a single list, converting them to a common format.
 * It also fetches the user's favorite markets and user's positions list (without the details).
 * @param userAddress - The user's address
 * @param enabled - Whether the query is enabled
 */
export const useLlamaMarkets = (userAddress?: Address, enabled = true) =>
  useQueries({
    queries: [
      getLendingVaultsOptions({}, enabled),
      getMintMarketOptions({}, enabled),
      getCampaignOptions({}, enabled),
      getFavoriteMarketOptions({}, enabled),
      getUserLendingVaultsOptions({ userAddress }, enabled),
      getUserLendingSuppliesOptions({ userAddress }, enabled),
      getUserMintMarketsOptions({ userAddress }, enabled),
    ],
    combine: (results): PartialQueryResult<LlamaMarketsResult> => {
      const [
        lendingVaults,
        mintMarkets,
        campaigns,
        favoriteMarkets,
        userLendingVaults,
        userSuppliedMarkets,
        userMintMarkets,
      ] = results
      const favoriteMarketsSet = new Set(favoriteMarkets.data)
      const userBorrows = new Set(recordValues(userLendingVaults.data ?? {}).flat())
      const userMints = new Set(recordValues(userMintMarkets.data ?? {}).flat())
      const userSupplied = new Set(recordValues(userSuppliedMarkets.data ?? {}).flat())
      const countMarket = createCountMarket()

      // only render table when both lending and mint markets are ready, however show one of them if the other is in error
      const showData = (lendingVaults.data && mintMarkets.data) || lendingVaults.isError || mintMarkets.isError
      const showUserData =
        !userAddress ||
        (userLendingVaults.data && userSuppliedMarkets.data && userMintMarkets.data) ||
        userLendingVaults.isError ||
        userSuppliedMarkets.isError ||
        userMintMarkets.isError

      const data: LlamaMarketsResult | undefined =
        showData && showUserData
          ? {
              userHasPositions:
                userBorrows.size > 0 || userMints.size > 0 || userSupplied.size > 0
                  ? {
                      [LlamaMarketType.Mint]: {
                        [MarketRateType.Borrow]: userMints.size > 0,
                        [MarketRateType.Supply]: false,
                      },
                      [LlamaMarketType.Lend]: {
                        [MarketRateType.Borrow]: userBorrows.size > 0,
                        [MarketRateType.Supply]: userSupplied.size > 0,
                      },
                    }
                  : null,
              hasFavorites: favoriteMarketsSet.size > 0,
              markets: [
                ...(lendingVaults.data ?? []).map((vault) =>
                  convertLendingVault(vault, favoriteMarketsSet, campaigns.data, userBorrows, userSupplied),
                ),
                ...(mintMarkets.data ?? []).map((market) =>
                  convertMintMarket(market, favoriteMarketsSet, campaigns.data, userMints, countMarket(market)),
                ),
              ],
            }
          : undefined
      return { ...combineQueriesMeta(results), data }
    },
  })
