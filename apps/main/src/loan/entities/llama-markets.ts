import {
  getLendingVaultOptions,
  getUserLendingVaultsOptions,
  LendingVault,
  type UserLendingVault,
} from '@/loan/entities/lending-vaults'
import { useQueries } from '@tanstack/react-query'
import {
  getMintMarketOptions,
  getUserMintMarketsOptions,
  MintMarket,
  type UserMintMarket,
} from '@/loan/entities/mint-markets'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, CRVUSD_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@curvefi/prices-api'
import { getFavoriteMarketOptions } from '@/loan/entities/favorite-markets'
import { getCampaignsOptions, PoolRewards } from '@/loan/entities/campaigns'
import type { Address } from '@ui-kit/utils'

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
}

export type LlamaMarket = {
  chain: Chain
  address: Address
  controllerAddress: Address
  assets: Assets
  utilizationPercent: number
  liquidityUsd: number
  rates: {
    lend: number | null // apy %, only for pools
    borrow: number // apy %
  }
  type: LlamaMarketType
  url: string
  rewards: PoolRewards | null
  isFavorite: boolean
  leverage: number
  deprecatedMessage?: string
  userCollateralEroded: boolean
  userEarnings: number | null
  userDeposited: number | null
  userBorrowed: number | null
  userHealth: number | null
}

const DEPRECATED_LLAMAS: Record<string, () => string> = {
  '0x136e783846ef68C8Bd00a3369F787dF8d683a696': () =>
    t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
}

const convertLendingVault = (
  {
    controller,
    chain,
    totalAssetsUsd,
    totalDebtUsd,
    vault,
    collateralToken,
    collateralBalance,
    collateralBalanceUsd,
    borrowedToken,
    borrowedBalance,
    borrowedBalanceUsd,
    apyBorrow,
    apyLend,
    leverage,
  }: LendingVault,
  favoriteMarkets: Set<string> | undefined,
  campaigns: Record<string, PoolRewards> | undefined = {},
  userLendingVaults: Record<Address, UserLendingVault> | undefined = {},
): LlamaMarket => ({
  chain,
  address: vault,
  controllerAddress: controller,
  assets: {
    borrowed: {
      ...borrowedToken,
      usdPrice: borrowedBalanceUsd / borrowedBalance,
      chain,
    },
    collateral: {
      ...collateralToken,
      chain,
      usdPrice: collateralBalanceUsd / collateralBalance,
    },
  },
  utilizationPercent: (100 * totalDebtUsd) / totalAssetsUsd,
  liquidityUsd: collateralBalanceUsd + borrowedBalanceUsd,
  rates: { lend: apyLend, borrow: apyBorrow },
  type: LlamaMarketType.Lend,
  url: `${APP_LINK.lend.root}#/${chain}${LEND_ROUTES.PAGE_MARKETS}/${vault}/create`,
  isFavorite: favoriteMarkets?.has(vault) || false,
  rewards: campaigns[vault.toLowerCase()] ?? null,
  leverage,
  userCollateralEroded: userLendingVaults[controller]?.softLiquidation,
  userEarnings: userLendingVaults[controller]?.collateralUp ?? null, // todo: check if correct
  userDeposited: userLendingVaults[controller]?.totalDeposited ?? null,
  userBorrowed: userLendingVaults[controller]?.borrowed ?? null,
  userHealth: userLendingVaults[controller]?.health ?? null,
})

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
    debtCeiling,
    stablecoin_price,
    chain,
  }: MintMarket,
  favoriteMarkets: Set<string> | undefined,
  campaigns: Record<string, PoolRewards> | undefined = {},
  userMintMarketsData: Record<Address, UserMintMarket> | undefined = {},
): LlamaMarket => ({
  chain,
  address,
  controllerAddress: llamma,
  assets: {
    borrowed: {
      symbol: stablecoinToken.symbol,
      address: stablecoinToken.address,
      usdPrice: stablecoin_price,
      chain,
    },
    collateral: {
      symbol: collateralToken.symbol,
      address: collateralToken.address,
      usdPrice: collateralAmountUsd / collateralAmount,
      chain,
    },
  },
  utilizationPercent: Math.min(100, (100 * borrowed) / debtCeiling), // debt ceiling may be lowered
  // todo: do we want to see collateral or borrowable?
  liquidityUsd: collateralAmountUsd,
  rates: { borrow: rate, lend: null },
  type: LlamaMarketType.Mint,
  deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
  url: `/${chain}${CRVUSD_ROUTES.PAGE_MARKETS}/${collateralToken.symbol}/create`,
  isFavorite: favoriteMarkets?.has(address) || false,
  rewards: campaigns[address.toLowerCase()] ?? null,
  leverage: 0,
  userCollateralEroded: userMintMarketsData[llamma]?.softLiquidation,
  userEarnings: userMintMarketsData[llamma]?.collateralUp ?? null, // todo: check if correct
  userDeposited: userMintMarketsData[llamma]?.totalDeposited ?? null,
  userBorrowed: userMintMarketsData[llamma]?.debt ?? null,
  userHealth: userMintMarketsData[llamma]?.health ?? null,
})

export const useLlamaMarkets = (userAddress?: Address) =>
  useQueries({
    queries: [
      getLendingVaultOptions({}),
      getMintMarketOptions({}),
      getCampaignsOptions({}),
      getFavoriteMarketOptions({}),
      getUserLendingVaultsOptions({ userAddress }),
      getUserMintMarketsOptions({ userAddress }),
    ],
    combine: (results): PartialQueryResult<LlamaMarket[]> => {
      const [lendingVaults, mintMarkets, campaigns, favoriteMarkets, userLendingVaults, userMintMarkets] = results
      const favoriteMarketsSet = new Set(favoriteMarkets.data)
      console.log(userAddress, results)
      return {
        ...combineQueriesMeta(results),
        data: [
          ...(lendingVaults.data ?? [])
            .filter((vault) => vault.totalAssetsUsd)
            .map((vault) => convertLendingVault(vault, favoriteMarketsSet, campaigns.data, userLendingVaults.data)),
          ...(mintMarkets.data ?? []).map((market) =>
            convertMintMarket(market, favoriteMarketsSet, campaigns.data, userMintMarkets.data),
          ),
        ],
      }
    },
  })
