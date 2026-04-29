import { type Address, erc20Abi, parseUnits } from 'viem'
import {
  getBadDebtLendMarketsOptions,
  getBadDebtMintMarketsOptions,
} from '@/llamalend/queries/market/market-bad-debt.query'
import { getFavoriteMarketOptions } from '@/llamalend/queries/market-list/favorite-markets'
import {
  getLendingVaultsOptions,
  getUserLendingSuppliesOptions,
  getUserLendingVaultsOptions,
  type LendingVault,
} from '@/llamalend/queries/market-list/lending-vaults'
import { getMintMarketOptions, getUserMintMarketsOptions } from '@/llamalend/queries/market-list/mint-markets'
import type { BadDebt } from '@curvefi/prices-api/liquidations'
import { oneAddress } from '@cy/support/generators'
import type { Decimal } from '@primitives/decimal.utils'
import { getCampaignsExternalOptions } from '@ui-kit/entities/campaigns/campaigns-external'
import { getCampaignsMarketsMerklOptions } from '@ui-kit/entities/campaigns/campaigns-markets-merkl'
import { queryClient } from '@ui-kit/lib/api'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { BlockchainIds } from '@ui-kit/utils/network'
import { readContractsQueryOptions } from '@wagmi/core/query'
import { oneInt } from '../../generators'
import { TEST_ADDRESS } from './mock-loan-test-data'
import { createMockLendMarket } from './mock-market.helpers'
import { mockedWagmiConfig } from './test-wagmi.helpers'

export const seedErc20BalanceQuery = ({
  chainId,
  tokenAddress,
  userAddress,
  rawBalance,
  decimals = 18,
}: {
  chainId: number
  tokenAddress: Address
  userAddress: Address
  rawBalance: bigint
  decimals?: number
}) => {
  const { queryKey } = readContractsQueryOptions(mockedWagmiConfig, {
    contracts: [
      { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] },
      { chainId, address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
    ] as const,
  })
  queryClient.setQueryData(queryKey, [
    { status: 'success', result: rawBalance },
    { status: 'success', result: decimals },
  ])
}

export const seedErc20BalanceForAddresses = ({
  chainId,
  tokenAddress,
  addresses,
  rawBalance,
  decimals = 18,
}: {
  chainId: number
  tokenAddress: Address
  addresses: Address[]
  rawBalance: bigint
  decimals?: number
}) =>
  addresses.forEach(userAddress =>
    seedErc20BalanceQuery({
      chainId,
      tokenAddress,
      userAddress,
      rawBalance,
      decimals,
    }),
  )

export const seedCrvUsdBalance = ({
  chainId,
  addresses,
  min,
  max = `${Number(min) * 100}`,
  decimals = 18,
}: {
  chainId: number
  addresses: Address[]
  min: Decimal
  max?: Decimal
  decimals?: number
}) =>
  seedErc20BalanceForAddresses({
    chainId,
    tokenAddress: CRVUSD_ADDRESS as Address,
    addresses,
    rawBalance: parseUnits(`${oneInt(Math.ceil(Number(min)), Math.ceil(Number(max)))}`, decimals),
    decimals,
  })

export const seedLendMarketSolvencyQueries = ({
  chainId,
  market,
  solvencyPercent,
}: {
  chainId: number
  market: ReturnType<typeof createMockLendMarket>
  solvencyPercent: number
}) => {
  const chain = BlockchainIds[chainId]!
  const totalAssetsUsd = 100
  const badDebt = (totalAssetsUsd * (100 - solvencyPercent)) / 100
  const controllerAddress = market.addresses.controller as Address
  const vaultAddress = market.addresses.vault as Address
  const collateralAddress = market.collateral_token.address as Address
  const borrowedAddress = market.borrowed_token.address as Address
  const emptyUserMarkets = {} as Record<typeof chain, Address[]>

  // These two seeded query inputs are the ones that actually determine solvency.
  queryClient.setQueryData(getLendingVaultsOptions({}, true).queryKey, [
    {
      controller: controllerAddress,
      chain,
      totalAssets: totalAssetsUsd,
      totalAssetsUsd,
      totalDebt: 20,
      totalDebtUsd: 20,
      vault: vaultAddress,
      llamma: oneAddress() as Address,
      collateralToken: {
        symbol: market.collateral_token.symbol,
        address: collateralAddress,
        rebasingYield: null,
        rebasingYieldApr: null,
      },
      borrowedToken: {
        symbol: market.borrowed_token.symbol,
        address: borrowedAddress,
        rebasingYield: null,
        rebasingYieldApr: null,
      },
      borrowedBalanceUsd: 0,
      collateralBalanceUsd: 0,
      borrowApy: 0.0825,
      borrowApr: 0.0825,
      apyLend: 0.0456,
      aprLendCrv0Boost: 0,
      aprLendCrvMaxBoost: 0,
      leverage: 1,
      extraRewardApr: [],
      maxLtv: 80,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    } as unknown as LendingVault,
  ])
  queryClient.setQueryData(getBadDebtLendMarketsOptions(true).queryKey, [
    {
      chain,
      market: market.id,
      softLiquidationUsers: 0,
      controllerAddress,
      badDebt,
      liquidatablePositions: 0,
      liquidatablePosDebtUsd: 0,
      liquidatableCollateralUsd: 0,
      liquidatableBorrowedUsd: null,
      liquidatableStablecoinUsd: null,
    } as BadDebt[number],
  ])

  // The rest are only seeded so the combined `useLlamaMarkets()` query resolves cleanly.
  queryClient.setQueryData(getMintMarketOptions({}, true).queryKey, [])
  queryClient.setQueryData(getBadDebtMintMarketsOptions(true).queryKey, [])
  queryClient.setQueryData(getCampaignsExternalOptions({}, true).queryKey, {})
  queryClient.setQueryData(getCampaignsMarketsMerklOptions({}, true).queryKey, {})
  queryClient.setQueryData(getFavoriteMarketOptions({}, true).queryKey, [])
  queryClient.setQueryData(getUserLendingVaultsOptions({ userAddress: TEST_ADDRESS }, true).queryKey, emptyUserMarkets)
  queryClient.setQueryData(
    getUserLendingSuppliesOptions({ userAddress: TEST_ADDRESS }, true).queryKey,
    emptyUserMarkets,
  )
  queryClient.setQueryData(getUserMintMarketsOptions({ userAddress: TEST_ADDRESS }, true).queryKey, emptyUserMarkets)
}
