import { countBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import { ethAddress } from 'viem'
import { type Chain } from '@curvefi/prices-api'
import { type PartialRecord, recordValues } from '@curvefi/prices-api/objects.util'
import { useQueries } from '@tanstack/react-query'
import type { QueriesResults } from '@tanstack/react-query'
import { type DeepKeys } from '@tanstack/table-core'
import { combineCampaigns, type CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { getCampaignsExternalOptions } from '@ui-kit/entities/campaigns/campaigns-external'
import { getCampaignsMerklOptions } from '@ui-kit/entities/campaigns/campaigns-merkl'
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
  maxLtv: number
  utilizationPercent: number
  liquidityUsd: number
  tvl: number
  totalDebtUsd: number
  totalCollateralUsd: number
  debtCeiling: number | null // only for mint markets, null for lend markets
  rates: {
    lendApr: number | null // base lend APR %
    lendCrvAprUnboosted: number | null
    lendCrvAprBoosted: number | null
    lendTotalApyMinBoosted: number | null
    lendTotalApyMaxBoosted: number | null // supply rate + rebasing yield + total extra incentives + max boosted yield
    borrowApy: number // base borrow APY %
    borrowTotalApy: number // borrow - yield from collateral
    // extra lending incentives, like OP rewards (so non CRV)
    incentives: ExtraIncentive[]
  }
  type: LlamaMarketType
  url: string
  rewards: CampaignPoolRewards[]
  isFavorite: boolean
  leverage: number
  deprecatedMessage: string | null
  userHasPositions: Record<MarketRateType, boolean> | null // null means no positions in either market and makes easy to filter
}

export type LlamaMarketsResult = {
  markets: LlamaMarket[]
  userHasPositions: Record<LlamaMarketType, Record<MarketRateType, boolean>> | null
  hasFavorites: boolean
}

export type LlamaMarketKey = DeepKeys<LlamaMarket>

const DEPRECATED_LLAMAS: PartialRecord<Chain, Record<Address, string>> = {
  ethereum: {
    // sfrxETH v1 mint market
    '0x136e783846ef68C8Bd00a3369F787dF8d683a696': t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
    // swBTC-crvUSD lend market
    '0x276B8C8873079eEACCF4Dd241De14be92D733b45': t`This market is empty (it's never been used) and the oracle cannot be trusted.`,
    //wstUSR-crvUSD lend market
    '0x89707721927d7aaeeee513797A8d6cBbD0e08f41': t`This market is deprecated.`,
    // iBTC-crvUSD lend market
    '0x3e293dB65c81742e32b74E21A0787d2936beeDf7': t`iBTC token is deprecated.`,
  },
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
    maxLtv,
  }: LendingVault,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, CampaignPoolRewards[]> = {},
  userBorrows: Set<Address>,
  userSupplied: Set<Address>,
): LlamaMarket => {
  const hasBorrowed = userBorrows.has(controller)
  const hasSupplied = userSupplied.has(vault)
  const totalExtraRewardApr = (extraRewardApr ?? []).reduce((acc, x) => acc + x.rate, 0)
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
    maxLtv,
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
      lendApr,
      lendCrvAprUnboosted,
      lendCrvAprBoosted,
      lendTotalApyMinBoosted:
        lendApr + (lendCrvAprUnboosted ?? 0) + (borrowedToken?.rebasingYield ?? 0) + totalExtraRewardApr,
      lendTotalApyMaxBoosted:
        lendApr + (borrowedToken?.rebasingYield ?? 0) + totalExtraRewardApr + (lendCrvAprBoosted ?? 0),
      borrowApy: apyBorrow,
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
    deprecatedMessage: DEPRECATED_LLAMAS[chain]?.[controller] ?? null,
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
    leverage,
    chain,
    maxLtv,
  }: MintMarket,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, CampaignPoolRewards[]> = {},
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
    maxLtv,
    utilizationPercent: Math.min(100, (100 * borrowed) / debtCeiling), // debt ceiling may be lowered, so cap at 100%
    debtCeiling,
    liquidityUsd: borrowable,
    tvl: collateralAmountUsd,
    totalDebtUsd: borrowedUsd,
    totalCollateralUsd: collateralAmountUsd,
    rates: {
      borrowApy: rate * 100,
      lendApr: null,
      lendCrvAprBoosted: null,
      lendCrvAprUnboosted: null,
      lendTotalApyMinBoosted: null,
      lendTotalApyMaxBoosted: null,
      borrowTotalApy: rate * 100 - (collateralToken.rebasingYield ?? 0),
      incentives: [],
    },
    type: LlamaMarketType.Mint,
    deprecatedMessage: DEPRECATED_LLAMAS[chain]?.[llamma] ?? null,
    url: getInternalUrl(
      'crvusd',
      chain,
      `${CRVUSD_ROUTES.PAGE_MARKETS}/${name}/${hasBorrow ? 'manage/loan' : 'create'}`,
    ),
    isFavorite: favoriteMarkets.has(llamma),
    rewards: [...(campaigns[address.toLowerCase()] ?? []), ...(campaigns[llamma.toLowerCase()] ?? [])],
    leverage,
    userHasPositions: hasBorrow ? { [MarketRateType.Borrow]: hasBorrow, [MarketRateType.Supply]: false } : null,
  }
}

/**
 * Creates a function that counts the number of markets for each collateral token.
 * Numbers are added to the first items (e.g., first ETH gets 3, second gets 2, last gets 1).
 * @returns A function that takes a MintMarket and returns the count of markets for the collateral token.
 */
function createCountMarket(data: MintMarket[] | undefined = []) {
  const getName = ({ collateralToken }: MintMarket) => getCollateral(collateralToken)[0]
  const marketCountByCollateral = countBy(data, getName)
  return (m: MintMarket) => marketCountByCollateral[getName(m)]--
}

type LlamaMarketsQueries = [
  ReturnType<typeof getLendingVaultsOptions>,
  ReturnType<typeof getMintMarketOptions>,
  ReturnType<typeof getCampaignsExternalOptions>,
  ReturnType<typeof getCampaignsMerklOptions>,
  ReturnType<typeof getFavoriteMarketOptions>,
  ReturnType<typeof getUserLendingVaultsOptions>,
  ReturnType<typeof getUserLendingSuppliesOptions>,
  ReturnType<typeof getUserMintMarketsOptions>,
]

/**
 * Query hook combining all lend and mint markets of all chains into a single list, converting them to a common format.
 * It also fetches the user's favorite markets and user's positions list (without the details).
 * @param userAddress - The user's address
 * @param enabled - Whether the query is enabled
 */
export const useLlamaMarkets = (userAddress?: Address, enabled = true) =>
  useQueries({
    queries: useMemo<LlamaMarketsQueries>(
      () => [
        getLendingVaultsOptions({}, enabled),
        getMintMarketOptions({}, enabled),
        getCampaignsExternalOptions({}, enabled),
        getCampaignsMerklOptions({}, enabled),
        getFavoriteMarketOptions({}, enabled),
        getUserLendingVaultsOptions({ userAddress }, enabled),
        getUserLendingSuppliesOptions({ userAddress }, enabled),
        getUserMintMarketsOptions({ userAddress }, enabled),
      ],
      [enabled, userAddress],
    ),
    combine: useCallback(
      (results: QueriesResults<LlamaMarketsQueries>): PartialQueryResult<LlamaMarketsResult> => {
        if (!enabled) {
          // the query is used in the header, let's make sure we don't waste resources when llamalend isn't selected
          return { isLoading: false, isPending: false, isError: false, isFetching: false, data: undefined }
        }
        const [
          lendingVaults,
          mintMarkets,
          externalCampaigns,
          merklCampaigns,
          favoriteMarkets,
          userLendingVaults,
          userSuppliedMarkets,
          userMintMarkets,
        ] = results
        const favoriteMarketsSet = new Set(favoriteMarkets.data)
        const userBorrows = new Set(recordValues(userLendingVaults.data ?? {}).flat())
        const userMints = new Set(recordValues(userMintMarkets.data ?? {}).flat())
        const userSupplied = new Set(recordValues(userSuppliedMarkets.data ?? {}).flat())
        const countMarket = createCountMarket(mintMarkets.data)
        const campaigns = combineCampaigns(externalCampaigns.data, merklCampaigns.data)

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
                    convertLendingVault(vault, favoriteMarketsSet, campaigns, userBorrows, userSupplied),
                  ),
                  ...(mintMarkets.data ?? []).map((market) =>
                    convertMintMarket(market, favoriteMarketsSet, campaigns, userMints, countMarket(market)),
                  ),
                ],
              }
            : undefined
        return { ...combineQueriesMeta(results), data }
      },
      [enabled, userAddress],
    ),
  })
