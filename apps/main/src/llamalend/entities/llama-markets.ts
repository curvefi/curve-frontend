import { ethAddress } from 'viem'
import { getFavoriteMarketOptions } from '@/llamalend/entities/favorite-markets'
import { getLendingVaultsOptions, getUserLendingVaultsOptions, LendingVault } from '@/llamalend/entities/lending-vaults'
import { getUserLendingSuppliesOptions } from '@/llamalend/entities/lending-vaults'
import { getMintMarketOptions, getUserMintMarketsOptions, MintMarket } from '@/llamalend/entities/mint-markets'
import { Chain } from '@curvefi/prices-api'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { useQueries } from '@tanstack/react-query'
import { type DeepKeys } from '@tanstack/table-core'
import { getCampaignsOptions, type PoolRewards } from '@ui-kit/entities/campaigns'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { CRVUSD_ROUTES, getInternalUrl, LEND_ROUTES } from '@ui-kit/shared/routes'
import { type Address } from '@ui-kit/utils'

export enum LlamaMarketType {
  Mint = 'Mint',
  Lend = 'Lend',
}

export type Assets = {
  borrowed: AssetDetails
  collateral: AssetDetails
}

export type AssetDetails = {
  symbol: string
  address: string
  chain: Chain
  usdPrice: number | null
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
  debtCeiling: number | null // only for mint markets, null for lend markets
  rates: {
    lend: number | null // lendApr + CRV unboosted + yield from collateral
    lendApr: number | null // base lend APR %
    lendCrvAprUnboosted: number | null
    lendCrvAprBoosted: number | null
    borrow: number // base borrow APY %
    borrowTotalApy: number // borrow - yield from collateral
    // extra lending incentives, like OP rewards (so non CRV)
    incentives: {
      address: Address
      symbol: string
      rate: number
    }[]
  }
  type: LlamaMarketType
  url: string
  rewards: PoolRewards[]
  isFavorite: boolean
  leverage: number
  deprecatedMessage?: string
  userHasPosition: { lend: boolean; borrow: boolean } | null // null means no positions in either market and makes easy to filter
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
  const hasBorrow = userBorrows.has(controller)
  const hasLend = userSupplied.has(vault)
  const hasPosition = hasBorrow || hasLend
  const totalExtraRewardApr = (extraRewardApr ?? []).reduce((acc, x) => acc + x.rate, 0)
  const lend = lendApr + (lendCrvAprUnboosted ?? 0) + (borrowedToken?.rebasingYield ?? 0) + totalExtraRewardApr
  return {
    chain,
    address: vault,
    controllerAddress: controller,
    assets: {
      borrowed: {
        ...borrowedToken,
        usdPrice: totalDebt && totalDebtUsd / totalDebt,
        chain,
        balance: totalDebt,
        balanceUsd: totalDebtUsd,
      },
      collateral: {
        ...collateralToken,
        chain,
        usdPrice: totalAssets && totalAssetsUsd / totalAssets,
        balance: totalAssets,
        balanceUsd: totalAssetsUsd,
      },
    },
    utilizationPercent: totalAssetsUsd && (100 * totalDebtUsd) / totalAssetsUsd,
    debtCeiling: null, // debt ceiling is not applicable for lend markets
    liquidityUsd: totalAssetsUsd - totalDebtUsd,
    rates: {
      lend, // this is the total yield, including incentive and collateral yield, and is displayed in the table
      lendApr,
      lendCrvAprUnboosted,
      lendCrvAprBoosted,
      borrow: apyBorrow,
      // as confusing as it may be, `borrow` is used in the table, but the total borrow is only in the tooltip
      borrowTotalApy: apyBorrow - (collateralToken?.rebasingYield ?? 0),
      incentives: extraRewardApr ?? [],
    },
    type: LlamaMarketType.Lend,
    url: getInternalUrl(
      'lend',
      chain,
      `${LEND_ROUTES.PAGE_MARKETS}/${controller}/${hasPosition ? 'manage' : 'create'}`,
    ),
    isFavorite: favoriteMarkets.has(vault),
    rewards: [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])],
    leverage,
    userHasPosition: hasPosition ? { borrow: hasBorrow, lend: hasLend } : null,
  }
}

/** We show WETH as ETH in the UI and market URL. Also change address so the symbol is correct */
const getCollateral = ({ address, symbol }: { address: Address; symbol: string }) =>
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
    borrowable,
    debtCeiling,
    stablecoin_price,
    chain,
  }: MintMarket,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, PoolRewards[]> = {},
  userMintMarkets: Set<Address>,
): LlamaMarket => {
  const hasBorrow = userMintMarkets.has(address)
  const [collateralSymbol, collateralAddress] = getCollateral(collateralToken)
  return {
    chain,
    address: llamma,
    controllerAddress: address,
    assets: {
      borrowed: {
        symbol: stablecoinToken.symbol,
        address: stablecoinToken.address,
        usdPrice: stablecoin_price,
        chain,
        balance: borrowed,
        balanceUsd: borrowed * stablecoin_price,
        rebasingYield: null,
      },
      collateral: {
        symbol: collateralSymbol,
        address: collateralAddress,
        usdPrice: collateralAmountUsd / collateralAmount,
        chain,
        balance: collateralAmount,
        balanceUsd: collateralAmountUsd,
        rebasingYield: null,
      },
    },
    utilizationPercent: Math.min(100, (100 * borrowed) / debtCeiling), // debt ceiling may be lowered, so cap at 100%
    debtCeiling,
    liquidityUsd: borrowable,
    rates: {
      borrow: rate * 100,
      lend: null,
      lendApr: null,
      lendCrvAprBoosted: null,
      lendCrvAprUnboosted: null,
      borrowTotalApy: rate * 100,
      incentives: [],
    },
    type: LlamaMarketType.Mint,
    deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
    url: getInternalUrl(
      'crvusd',
      chain,
      `${CRVUSD_ROUTES.PAGE_MARKETS}/${collateralSymbol}/${hasBorrow ? 'manage/loan' : 'create'}`,
    ),
    isFavorite: favoriteMarkets.has(llamma),
    rewards: [...(campaigns[address.toLowerCase()] ?? []), ...(campaigns[llamma.toLowerCase()] ?? [])],
    leverage: 0,
    userHasPosition: hasBorrow ? { borrow: hasBorrow, lend: false } : null, // mint markets do not have lend positions
  }
}

export type LlamaMarketsResult = {
  markets: LlamaMarket[]
  hasPositions: boolean
  hasFavorites: boolean
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
      getCampaignsOptions({}, enabled),
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

      // only render table when both lending and mint markets are ready, however show one of them if the other is in error
      const showData = (lendingVaults.data && mintMarkets.data) || lendingVaults.isError || mintMarkets.isError
      const showUserData =
        !userAddress ||
        (userLendingVaults.data && userSuppliedMarkets.data && userMintMarkets.data) ||
        userLendingVaults.isError ||
        userSuppliedMarkets.isError ||
        userMintMarkets.isError
      const data =
        showData && showUserData
          ? {
              hasPositions: userBorrows.size > 0 || userMints.size > 0 || userSupplied.size > 0,
              hasFavorites: favoriteMarketsSet.size > 0,
              markets: [
                ...(lendingVaults.data ?? []).map((vault) =>
                  convertLendingVault(vault, favoriteMarketsSet, campaigns.data, userBorrows, userSupplied),
                ),
                ...(mintMarkets.data ?? []).map((market) =>
                  convertMintMarket(market, favoriteMarketsSet, campaigns.data, userMints),
                ),
              ],
            }
          : undefined
      return { ...combineQueriesMeta(results), data }
    },
  })
