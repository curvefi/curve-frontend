import { countBy, sumBy } from 'lodash'
import { useCallback, useMemo } from 'react'
import { ethAddress, isAddressEqual } from 'viem'
import { useConnection } from 'wagmi'
import { LLAMMALEND_V2_DATE } from '@/llamalend/constants'
import { aprToApy, computeTotalRate, getSupplyApyMetrics } from '@/llamalend/rates.utils'
import { type Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { recordValues } from '@primitives/objects.utils'
import type { QueriesResults } from '@tanstack/react-query'
import { useQueries } from '@tanstack/react-query'
import { type CampaignPoolRewards, combineCampaigns } from '@ui-kit/entities/campaigns'
import { getCampaignsExternalOptions } from '@ui-kit/entities/campaigns/campaigns-external'
import { getCampaignsMerklOptions } from '@ui-kit/entities/campaigns/campaigns-merkl'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useLLv2 } from '@ui-kit/hooks/useFeatureFlags'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { CRVUSD_ROUTES, getInternalUrl, LEND_ROUTES } from '@ui-kit/shared/routes'
import { type ExtraIncentive, LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { useMappedQuery } from '@ui-kit/types/util'
import { DEPRECATED_LLAMAS, NO_LEVERAGE_LEND } from '../../llama-markets.constants'
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
  rebasingYieldApr: number | null
}

export type LlamaMarket = {
  chain: Chain
  ammAddress: Address
  controllerAddress: Address
  vaultAddress: Address | null
  assets: Assets
  version: 'v1' | 'v2'
  maxLtv: number
  utilizationPercent: number
  liquidityUsd: number
  tvl: number
  totalDebtUsd: number
  totalCollateralUsd: number
  debtCeiling: number | null // only for mint markets, null for lend markets
  rates: {
    lendApy: number | null // base lend APY %
    lendCrvAprUnboosted: number | null
    lendCrvAprBoosted: number | null
    lendTotalApyMinBoosted: number | null
    lendTotalApyMaxBoosted: number | null // supply rate + rebasing yield + total extra incentives + max boosted yield
    borrowApy: number // base borrow APY %
    borrowTotalApy: number // borrow APY - yield from collateral
    borrowApr: number
    borrowTotalApr: number // borrow APR - yield from collateral
    // extra lending incentives, like OP rewards (so non CRV)
    incentives: ExtraIncentive[]
  }
  type: LlamaMarketType
  url: string
  rewards: CampaignPoolRewards[]
  isFavorite: boolean
  leverage: number | null
  deprecatedMessage: string | null
  userHasPositions: Record<MarketRateType, boolean> | null // null means no positions in either market and makes easy to filter
  createdAt: number
  favoriteKey: Address // this differs per market type; for lend markets the vault address, for mint markets the amm address
}

export type LlamaMarketsResult = {
  markets: LlamaMarket[]
  userHasPositions: Record<LlamaMarketType, Record<MarketRateType, boolean>> | null
  hasFavorites: boolean
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
    llamma,
    collateralToken,
    borrowedToken,
    borrowedBalanceUsd,
    collateralBalanceUsd,
    borrowApy,
    borrowApr,
    apyLend: lendApy,
    aprLendCrv0Boost: lendCrvAprUnboosted,
    aprLendCrvMaxBoost: lendCrvAprBoosted,
    leverage,
    extraRewardApr,
    maxLtv,
    createdAt,
  }: LendingVault,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, CampaignPoolRewards[]> = {},
  userBorrows: Set<Address>,
  userSupplied: Set<Address>,
): LlamaMarket => {
  const marketType = LlamaMarketType.Lend
  const hasBorrowed = userBorrows.has(controller)
  const hasSupplied = userSupplied.has(vault)
  const totalExtraRewardApy =
    // sumBy returns 0 for empty arrays
    extraRewardApr.length ? sumBy(extraRewardApr, (reward) => aprToApy(reward.rate) as number) : null
  const { totalMinBoost, totalMaxBoost } = getSupplyApyMetrics({
    supplyApy: lendApy,
    crvBoostApr: [lendCrvAprUnboosted, lendCrvAprBoosted],
    rebasingYieldApy: borrowedToken?.rebasingYield,
    extraIncentivesApy: totalExtraRewardApy,
  })

  return {
    chain,
    controllerAddress: controller,
    ammAddress: llamma,
    vaultAddress: vault,
    version: 'v1', // todo: get version from backend
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
    totalDebtUsd,
    totalCollateralUsd: collateralBalanceUsd + borrowedBalanceUsd,
    tvl:
      borrowedBalanceUsd + // collateral converted to crvusd
      collateralBalanceUsd + // collateral
      totalAssetsUsd - // supplied assets
      totalDebtUsd,
    rates: {
      lendApy,
      lendCrvAprUnboosted,
      lendCrvAprBoosted,
      lendTotalApyMinBoosted: totalMinBoost,
      lendTotalApyMaxBoosted: totalMaxBoost,
      borrowApy,
      borrowTotalApy: computeTotalRate(borrowApy, collateralToken.rebasingYield ?? 0),
      borrowApr,
      borrowTotalApr: computeTotalRate(borrowApr, collateralToken.rebasingYieldApr ?? 0),
      incentives: extraRewardApr
        ? extraRewardApr.map(({ address, symbol, rate }) => ({
            title: symbol,
            percentage: rate,
            address,
            blockchainId: chain,
          }))
        : [],
    },
    type: marketType,
    url: getInternalUrl('lend', chain, `${LEND_ROUTES.PAGE_MARKETS}/${controller}`),
    deprecatedMessage: DEPRECATED_LLAMAS[marketType][chain]?.[controller]?.message ?? null,
    isFavorite: favoriteMarkets.has(vault),
    rewards: [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])],
    leverage: NO_LEVERAGE_LEND[chain]?.includes(controller) ? null : leverage,
    userHasPositions:
      hasBorrowed || hasSupplied
        ? {
            [MarketRateType.Borrow]: hasBorrowed,
            [MarketRateType.Supply]: hasSupplied,
          }
        : null,
    createdAt: new Date(createdAt).getTime(),
    favoriteKey: vault,
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
    borrowApy,
    borrowApr,
    borrowed,
    borrowedUsd,
    borrowable,
    debtCeiling,
    leverage,
    chain,
    maxLtv,
    createdAt,
  }: MintMarket,
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, CampaignPoolRewards[]> = {},
  userMintMarkets: Set<Address>,
  collateralIndex: number, // index in the list of markets with the same collateral token, used to create a unique name
): LlamaMarket => {
  const marketType = LlamaMarketType.Mint
  const hasBorrow = userMintMarkets.has(address)
  const [collateralSymbol, collateralAddress] = getCollateral(collateralToken)
  const name = collateralIndex > 1 ? `${collateralSymbol}${collateralIndex}` : collateralSymbol
  return {
    chain,
    controllerAddress: address,
    ammAddress: llamma,
    vaultAddress: null, // mint markets dont have these
    version: 'v1',
    assets: {
      borrowed: {
        symbol: stablecoinToken.symbol,
        address: stablecoinToken.address,
        chain,
        balance: borrowed,
        balanceUsd: borrowedUsd,
        rebasingYield: stablecoinToken.rebasingYield,
        rebasingYieldApr: stablecoinToken.rebasingYieldApr,
      },
      collateral: {
        symbol: collateralSymbol,
        address: collateralAddress,
        chain,
        balance: collateralAmount,
        balanceUsd: collateralAmountUsd,
        rebasingYield: collateralToken.rebasingYield,
        rebasingYieldApr: collateralToken.rebasingYieldApr,
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
      lendApy: null,
      lendCrvAprBoosted: null,
      lendCrvAprUnboosted: null,
      lendTotalApyMinBoosted: null,
      lendTotalApyMaxBoosted: null,
      borrowApy,
      borrowTotalApy: computeTotalRate(borrowApy, collateralToken.rebasingYield ?? 0),
      borrowApr,
      borrowTotalApr: computeTotalRate(borrowApr, collateralToken.rebasingYieldApr ?? 0),
      incentives: [],
    },
    type: marketType,
    deprecatedMessage: DEPRECATED_LLAMAS[marketType][chain]?.[address]?.message ?? null,
    url: getInternalUrl('crvusd', chain, `${CRVUSD_ROUTES.PAGE_MARKETS}/${name}`),
    isFavorite: favoriteMarkets.has(llamma),
    rewards: [...(campaigns[address.toLowerCase()] ?? []), ...(campaigns[llamma.toLowerCase()] ?? [])],
    leverage,
    userHasPositions: hasBorrow ? { [MarketRateType.Borrow]: hasBorrow, [MarketRateType.Supply]: false } : null,
    createdAt: new Date(createdAt).getTime(),
    favoriteKey: llamma,
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
export const useLlamaMarkets = (
  {
    userAddress,
    enableLLv2,
    showDeprecatedMarkets,
  }: { userAddress: Address | undefined; enableLLv2: boolean; showDeprecatedMarkets: boolean },
  enabled = true,
) =>
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
          return { isLoading: false, isPending: false, isError: false, isFetching: false, data: undefined, error: null }
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
                ].filter(
                  ({ createdAt, deprecatedMessage, userHasPositions }) =>
                    (createdAt <= LLAMMALEND_V2_DATE.getTime() || enableLLv2) &&
                    (!deprecatedMessage || showDeprecatedMarkets || userHasPositions),
                ),
              }
            : undefined
        return { ...combineQueriesMeta(results), data }
      },
      [enabled, userAddress, enableLLv2, showDeprecatedMarkets],
    ),
  })

export const useLlamaMarket = ({
  blockchainId,
  controllerAddress,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}) =>
  useMappedQuery(
    useLlamaMarkets({
      userAddress: useConnection().address,
      enableLLv2: useLLv2(),
      showDeprecatedMarkets: useUserProfileStore((state) => state.showDeprecatedMarkets),
    }),
    useCallback(
      ({ markets }) =>
        blockchainId &&
        controllerAddress &&
        markets?.find(
          (item) => item.chain === blockchainId && isAddressEqual(item.controllerAddress, controllerAddress),
        ),
      [blockchainId, controllerAddress],
    ),
  )
