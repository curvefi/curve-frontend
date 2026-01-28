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
  ammAddress: Address
  controllerAddress: Address
  vaultAddress: Address | null
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

export type LlamaMarketKey = DeepKeys<LlamaMarket>

const DEPRECATED_LLAMAS: PartialRecord<Chain, Record<Address, string>> = {
  ethereum: {
    // sfrxETH v1 mint market
    '0x8472A9A7632b173c8Cf3a86D3afec50c35548e76': t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
    // swBTC-crvUSD lend market
    '0x276B8C8873079eEACCF4Dd241De14be92D733b45': t`This market is empty (it's never been used) and the oracle cannot be trusted.`,
    //wstUSR-crvUSD lend market
    '0x89707721927d7aaeeee513797A8d6cBbD0e08f41': t`This market is deprecated.`,
    // LBTC-crvUSD v1 mint market
    '0x8aca5A776a878Ea1F8967e70a23b8563008f58Ef': t`This market is deprecated.`,
  },
  arbitrum: {
    // iBTC-crvUSD lend market
    '0x3e293dB65c81742e32b74E21A0787d2936beeDf7': t`iBTC is undergoing systematic unwinding`,
  },
  sonic: {
    // sTS-crvUSD lend market
    '0xB8C93fb97884Ea07c2Eb0eA741f78D10e8C5aF9F': t`This market is deprecated.`,
    // scETH-crvUSD lend market
    '0x7547E577B3DDC23c02E10792457f8e51a225692E': t`This market is deprecated.`,
    // wS-crvUSD lend market
    '0x5eD490a9B71fa797231d2c5D9bE25bf91a953C19': t`This market is deprecated.`,
    // scUSD-crvUSD lend market
    '0xbb7A0C558Fd34234Dc1608f4CD0a334E0075D73a': t`This market is deprecated.`,
    // wOS-crvUSD lend market
    '0xDC06056e208aB92bF173FF6DD662F1018ea0E483': t`This market is deprecated.`,
  },
  optimism: {
    // WBTC-crvUSD lend market
    '0x09cEd8b3392bED73B0358e39AaEC0A6e9b0e76DF': t`This market is deprecated.`,
    // CRV-crvUSD lend market
    '0x88aa928B906b745009B53A31034701Fc377b7C89': t`This market is deprecated.`,
    // wstETH-crvUSD lend market
    '0x6CE5B539367A29d48038A9F3108E6e0f226b83ed': t`This market is deprecated.`,
    // OP-crvUSD lend market
    '0xC5Cd9f6A1Fb88bed782f475F72fF686ED35b7e8e': t`This market is deprecated.`,
    // WETH-crvUSD lend market
    '0x9dba46e6a06FBf24CA11f8912B44338fe1b28Ea9': t`This market is deprecated.`,
  },
}

/**
 * The following markets do not support leverage, but there's no on-chain method
 * to determine this. Therefore, llamalend-js has the following hardcoded logic
 * to filter out those markets:
 *
 * ```typescript
 * private hasLeverage = (): boolean => {
     return this.llamalend.constants.ALIASES.leverage_zap !== this.llamalend.constants.ZERO_ADDRESS &&
       this._getMarketId() >= Number(this.llamalend.constants.ALIASES["leverage_markets_start_id"]);
 * }
 * ```
 *
 * However, we can't use that method in our market list, because we don't have
 * access to a (hydrated) llamalend instance. Therefore, the addresses have been
 * found by invoking the following code in prod, where api is a llamalend instance:
 *
 * ```typescript
 * const marketsWithoutLeverage = api.lendMarkets
 *   .getMarketList()
 *   .map((marketId) => api.getLendMarket(marketId))
 *   .filter((market) => !market.leverage.hasLeverage())
 *   .map((market) => [market.id, market.addresses.controller])
 * ```
 */
const NO_LEVERAGE_LEND: PartialRecord<Chain, Address[]> = {
  ethereum: [
    '0x1E0165DbD2019441aB7927C018701f3138114D71',
    '0xaade9230AA9161880E13a38C83400d3D1995267b',
    '0x413FD2511BAD510947a91f5c6c79EBD8138C29Fc',
    '0xEdA215b7666936DEd834f76f3fBC6F323295110A',
    '0xC510d73Ad34BeDECa8978B6914461aA7b50CF3Fc',
    '0xa5D9137d2A1Ee912469d911A8E74B6c77503bac8',
    '0xe438658874b0acf4D81c24172E137F0eE00621b8',
    '0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
    '0x09dBDEB3b301A4753589Ac6dF8A178C7716ce16B',
  ],
  arbitrum: [
    '0xB5B6f0E69c283AA32425FA18220e64283B51F0A4',
    '0x013be86e1cdb0f384dAF24Bd974FE75EdFfe6B68',
    '0x28c20590de7539C316191F413686dcF794d8898E',
    '0x5014AB37Fca7201baDEc3C0d0f28Dc7899cdC7D5',
    '0x88f88e937Db48bBfe8E3091718576430704e47Ab',
    '0x76709bC0dA299Ab0234EEC51385E900922AE98f5',
    '0xAe659CE8f2f23649E09e92D164244AA127A7a2c7',
    '0x7Adcc491f0B7f9BC12837B8F5Edf0e580d176F1f',
    '0x4064Ed6Ae070F126F56c47c8a8CdD6B924668b5D',
  ],
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
    borrowTotalApy,
    borrowApr,
    borrowTotalApr,
    aprLend: lendApr,
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
  const hasBorrowed = userBorrows.has(controller)
  const hasSupplied = userSupplied.has(vault)
  const totalExtraRewardApr = (extraRewardApr ?? []).reduce((acc, x) => acc + x.rate, 0)
  return {
    chain,
    controllerAddress: controller,
    ammAddress: llamma,
    vaultAddress: vault,
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
      borrowApy,
      borrowTotalApy,
      borrowApr,
      borrowTotalApr,
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
    borrowTotalApy,
    borrowApr,
    borrowTotalApr,
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
  const hasBorrow = userMintMarkets.has(address)
  const [collateralSymbol, collateralAddress] = getCollateral(collateralToken)
  const name = collateralIndex > 1 ? `${collateralSymbol}${collateralIndex}` : collateralSymbol
  return {
    chain,
    controllerAddress: address,
    ammAddress: llamma,
    vaultAddress: null, // mint markets dont have these
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
      lendApr: null,
      lendCrvAprBoosted: null,
      lendCrvAprUnboosted: null,
      lendTotalApyMinBoosted: null,
      lendTotalApyMaxBoosted: null,
      borrowApy,
      borrowTotalApy,
      borrowApr,
      borrowTotalApr,
      incentives: [],
    },
    type: LlamaMarketType.Mint,
    deprecatedMessage: DEPRECATED_LLAMAS[chain]?.[address] ?? null,
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
