import { getLendingVaultOptions, LendingVault } from '@/loan/entities/lending-vaults'
import { useQueries } from '@tanstack/react-query'
import { getMintMarketOptions, MintMarket } from '@/loan/entities/mint-markets'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, CRVUSD_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@curvefi/prices-api'
import { getFavoriteMarketOptions } from '@/loan/entities/favorite-markets'
import { getCampaignsOptions, PoolRewards } from '@/loan/entities/campaigns'

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
  address: string
  controllerAddress: string
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
  isCollateralEroded: boolean
  isFavorite: boolean
  leverage: number
  deprecatedMessage?: string
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
  favoriteMarkets: Set<string>,
  campaigns: Record<string, PoolRewards>,
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
  url: `${APP_LINK.lend.root}#/${chain}${LEND_ROUTES.PAGE_MARKETS}/${controller}/create`,
  isFavorite: favoriteMarkets.has(vault),
  rewards: campaigns[vault.toLowerCase()] ?? null,
  leverage,
  isCollateralEroded: false, // todo
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
    debtCeiling,
    stablecoin_price,
    chain,
  }: MintMarket,
  favoriteMarkets: Set<string>,
  campaigns: Record<string, PoolRewards>,
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
      symbol: getCollateralSymbol(collateralToken),
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
  url: `/${chain}${CRVUSD_ROUTES.PAGE_MARKETS}/${getCollateralSymbol(collateralToken)}/create`,
  isFavorite: favoriteMarkets.has(address),
  rewards: campaigns[address.toLowerCase()] ?? null,
  leverage: 0,
  isCollateralEroded: false, // todo
})

export const useLlamaMarkets = () =>
  useQueries({
    queries: [
      getLendingVaultOptions({}),
      getMintMarketOptions({}),
      getCampaignsOptions({}),
      getFavoriteMarketOptions({}),
    ],
    combine: ([lendingVaults, mintMarkets, campaigns, favoriteMarkets]): PartialQueryResult<LlamaMarket[]> => {
      const favoriteMarketsSet = new Set(favoriteMarkets.data)
      const campaignData = campaigns.data ?? {}
      return {
        ...combineQueriesMeta([lendingVaults, mintMarkets, favoriteMarkets]),
        data: [
          ...(lendingVaults.data ?? [])
            .filter((vault) => vault.totalAssetsUsd)
            .map((vault) => convertLendingVault(vault, favoriteMarketsSet, campaignData)),
          ...(mintMarkets.data ?? []).map((market) => convertMintMarket(market, favoriteMarketsSet, campaignData)),
        ],
      }
    },
  })
