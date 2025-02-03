import { getLendingVaultOptions, LendingVault } from '@/loan/entities/lending-vaults'
import { useQueries } from '@tanstack/react-query'
import { getMintMarketOptions, MintMarket } from '@/loan/entities/mint-markets'
import { combineQueriesMeta, PartialQueryResult } from '@ui-kit/lib'
import { t } from '@lingui/macro'
import { APP_LINK, CRVUSD_ROUTES, LEND_ROUTES } from '@ui-kit/shared/routes'

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
  blockchainId: string
  usdPrice: number | null
}

export type LlamaMarket = {
  blockchainId: string
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
  leverage: number
  deprecatedMessage?: string
}

const DEPRECATED_LLAMAS: Record<string, () => string> = {
  '0x136e783846ef68C8Bd00a3369F787dF8d683a696': () =>
    t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
}

const convertLendingVault = ({
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
}: LendingVault): LlamaMarket => ({
  blockchainId: chain,
  address: vault,
  controllerAddress: controller,
  assets: {
    borrowed: {
      ...borrowedToken,
      usdPrice: borrowedBalanceUsd / borrowedBalance,
      blockchainId: chain,
    },
    collateral: {
      ...collateralToken,
      blockchainId: chain,
      usdPrice: collateralBalanceUsd / collateralBalance,
    },
  },
  utilizationPercent: (100 * totalDebtUsd) / totalAssetsUsd,
  liquidityUsd: collateralBalanceUsd + borrowedBalanceUsd,
  rates: { lend: apyLend, borrow: apyBorrow },
  type: LlamaMarketType.Pool,
  url: `${APP_LINK.lend.root}#/${chain}${LEND_ROUTES.PAGE_MARKETS}/${vault}/create`,
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
  }: MintMarket,
  blockchainId: string,
): LlamaMarket => ({
  blockchainId,
  address,
  controllerAddress: llamma,
  assets: {
    borrowed: {
      symbol: stablecoinToken.symbol,
      address: stablecoinToken.address,
      usdPrice: stablecoin_price,
      blockchainId,
    },
    collateral: {
      symbol: collateralToken.symbol,
      address: collateralToken.address,
      usdPrice: collateralAmountUsd / collateralAmount,
      blockchainId,
    },
  },
  utilizationPercent: (100 * borrowed) / debtCeiling,
  // todo: do we want to see collateral or borrowable?
  liquidityUsd: collateralAmountUsd,
  rates: { borrow: rate },
  type: LlamaMarketType.Mint,
  deprecatedMessage: DEPRECATED_LLAMAS[llamma]?.(),
  url: `/${blockchainId}${CRVUSD_ROUTES.PAGE_MARKETS}/${collateralToken.symbol}/create`,
  // todo: implement the following
  hasPoints: false,
  leverage: 0,
  isCollateralEroded: false,
})

export const useLlamaMarkets = () =>
  useQueries({
    queries: [getLendingVaultOptions({}), getMintMarketOptions({})],
    combine: ([lendingVaults, mintMarkets]): PartialQueryResult<LlamaMarket[]> => ({
      ...combineQueriesMeta([lendingVaults, mintMarkets]),
      data: [
        ...(lendingVaults.data ?? []).filter((vault) => vault.totalAssetsUsd).map(convertLendingVault),
        ...(mintMarkets.data ?? []).flatMap(({ chain, data }) => data.map((i) => convertMintMarket(i, chain))),
      ],
    }),
  })
