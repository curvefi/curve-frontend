import { getCampaignsOptions, PoolRewards } from '@/loan/entities/campaigns'
import { getFavoriteMarketOptions } from '@/loan/entities/favorite-markets'
import { getLendingVaultsOptions, getUserLendingVaultsOptions, LendingVault } from '@/loan/entities/lending-vaults'
import { getMintMarketOptions, getUserMintMarketsOptions, MintMarket } from '@/loan/entities/mint-markets'
import { NetworkEnum } from '@/loan/types/loan.types'
import { getPath } from '@/loan/utils/utilsRouter'
import { Chain } from '@curvefi/prices-api'
import { useQueries } from '@tanstack/react-query'
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
  rewards: PoolRewards[]
  isFavorite: boolean
  leverage: number
  deprecatedMessage?: string
  userHasPosition: boolean
}

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
  favoriteMarkets: Set<Address>,
  campaigns: Record<string, PoolRewards[]> = {},
  userVaults: Set<Address>,
): LlamaMarket => ({
  chain,
  address: vault,
  controllerAddress: controller,
  assets: {
    borrowed: {
      ...borrowedToken,
      usdPrice: borrowedBalance ? borrowedBalanceUsd / borrowedBalance : totalAssets / totalAssetsUsd,
      chain,
    },
    collateral: {
      ...collateralToken,
      chain,
      usdPrice: collateralBalanceUsd / collateralBalance,
    },
  },
  utilizationPercent: (100 * totalDebtUsd) / totalAssetsUsd,
  liquidityUsd: totalAssetsUsd - totalDebtUsd,
  rates: { lend: apyLend, borrow: apyBorrow },
  type: LlamaMarketType.Lend,
  url: getInternalUrl(
    'lend',
    chain,
    `${LEND_ROUTES.PAGE_MARKETS}/${controller}/${userVaults.has(controller) ? 'manage' : 'create'}`,
  ),
  isFavorite: favoriteMarkets.has(vault),
  rewards: [...(campaigns[vault.toLowerCase()] ?? []), ...(campaigns[controller.toLowerCase()] ?? [])],
  leverage,
  userHasPosition: userVaults.has(controller),
})

/** We show WETH as ETH in the UI and market URL */
const getCollateralSymbol = ({ symbol }: { symbol: string }) => (symbol == 'WETH' ? 'ETH' : symbol)

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
): LlamaMarket => ({
  chain,
  address: llamma,
  controllerAddress: address,
  assets: {
    borrowed: {
      symbol: stablecoinToken.symbol,
      address: stablecoinToken.address,
      usdPrice: stablecoin_price,
      chain,
    },
    collateral: {
      symbol: getCollateralSymbol(collateralToken),
      address: collateralToken.address,
      usdPrice: collateralAmountUsd / collateralAmount,
      chain,
    },
  },
  utilizationPercent: Math.min(100, (100 * borrowed) / debtCeiling), // debt ceiling may be lowered, so cap at 100%
  liquidityUsd: borrowable,
  rates: { borrow: rate * 100, lend: null },
  type: LlamaMarketType.Mint,
  deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
  url: getPath(
    { network: chain as NetworkEnum },
    `${CRVUSD_ROUTES.PAGE_MARKETS}/${getCollateralSymbol(collateralToken)}/${userMintMarkets.has(address) ? 'manage' : 'create'}`,
  ),
  isFavorite: favoriteMarkets.has(address),
  rewards: [...(campaigns[address.toLowerCase()] ?? []), ...(campaigns[llamma.toLowerCase()] ?? [])],
  leverage: 0,
  userHasPosition: userMintMarkets.has(address),
})

export type LlamaMarketsResult = {
  markets: LlamaMarket[]
  hasPositions: boolean
  hasFavorites: boolean
}
/**
 * Query hook combining all lend and mint markets of all chains into a single list, converting them to a common format.
 * It also fetches the user's favorite markets and user's positions list (withouth the details).
 * @param userAddress - The user's address
 */
export const useLlamaMarkets = (userAddress?: Address) =>
  useQueries({
    queries: [
      getLendingVaultsOptions({}),
      getMintMarketOptions({}),
      getCampaignsOptions({}),
      getFavoriteMarketOptions({}),
      getUserLendingVaultsOptions({ userAddress }),
      getUserMintMarketsOptions({ userAddress }),
    ],
    combine: (results): PartialQueryResult<LlamaMarketsResult> => {
      const [lendingVaults, mintMarkets, campaigns, favoriteMarkets, userLendingVaults, userMintMarkets] = results
      const favoriteMarketsSet = new Set<Address>(favoriteMarkets.data)
      const userVaults = new Set<Address>(Object.values(userLendingVaults.data ?? {}).flat())
      const userMints = new Set<Address>(Object.values(userMintMarkets.data ?? {}).flat())

      // only render table when both lending and mint markets are ready, however show one of them if the other is in error
      const showData = (lendingVaults.data && mintMarkets.data) || lendingVaults.isError || mintMarkets.isError

      const data = showData
        ? {
            hasPositions: userVaults.size > 0 || userMints.size > 0,
            hasFavorites: favoriteMarketsSet.size > 0,
            markets: [
              ...(lendingVaults.data ?? [])
                .filter((vault) => vault.totalAssetsUsd)
                .map((vault) => convertLendingVault(vault, favoriteMarketsSet, campaigns.data, userVaults)),
              ...(mintMarkets.data ?? []).map((market) =>
                convertMintMarket(market, favoriteMarketsSet, campaigns.data, userMints),
              ),
            ],
          }
        : undefined
      return { ...combineQueriesMeta(results), data }
    },
  })
