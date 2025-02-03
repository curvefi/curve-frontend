import { getLendingVaultOptions, LendingVault } from '@/loan/entities/lending-vaults'
import { useQueries } from '@tanstack/react-query'
import { getMintMarketOptions, MintMarket } from '@/loan/entities/mint-markets'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@lingui/macro'
import { APP_LINK, CRVUSD_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'
import { Chain } from '@curvefi/prices-api'
import { getFavoriteMarketOptions } from '@/loan/entities/favorite-markets'

export enum LlamaMarketType {
  Mint = 'mint',
  Pool = 'pool',
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
    lend?: number // apy %, only for pools
    borrow: number // apy %
  }
  type: LlamaMarketType
  url: string
  hasPoints: boolean
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
  }: LendingVault,
  favoriteMarkets: Set<string>,
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
  type: LlamaMarketType.Pool,
  url: `${APP_LINK.lend.root}#/${chain}${LEND_ROUTES.PAGE_MARKETS}/${vault}/create`,
  isFavorite: favoriteMarkets.has(vault),
  // todo: implement the following
  hasPoints: false,
  leverage: 0,
  isCollateralEroded: false,
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
  favoriteMarkets: Set<string>,
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
  utilizationPercent: (100 * borrowed) / debtCeiling,
  // todo: do we want to see collateral or borrowable?
  liquidityUsd: collateralAmountUsd,
  rates: { borrow: rate },
  type: LlamaMarketType.Mint,
  deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
  url: `/${chain}${CRVUSD_ROUTES.PAGE_MARKETS}/${collateralToken.symbol}/create`,
  isFavorite: favoriteMarkets.has(address),
  // todo: implement the following
  hasPoints: false,
  leverage: 0,
  isCollateralEroded: false,
})

export const useLlamaMarkets = () =>
  useQueries({
    queries: [getLendingVaultOptions({}), getMintMarketOptions({}), getFavoriteMarketOptions({})],
    combine: ([lendingVaults, mintMarkets, favoriteMarkets]): PartialQueryResult<LlamaMarket[]> => {
      const favoriteMarketsSet = new Set(favoriteMarkets.data)
      return {
        ...combineQueriesMeta([lendingVaults, mintMarkets, favoriteMarkets]),
        data: [
          ...(lendingVaults.data ?? [])
            .filter((vault) => vault.totalAssetsUsd)
            .map((vault) => convertLendingVault(vault, favoriteMarketsSet)),
          ...(mintMarkets.data ?? []).flatMap((markets) =>
            markets.map((market) => convertMintMarket(market, favoriteMarketsSet)),
          ),
        ],
      }
    },
  })
