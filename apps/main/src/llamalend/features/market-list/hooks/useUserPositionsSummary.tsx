import { sum, uniqBy } from 'lodash'
import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getUserLendingVaultStatsOptions } from '@/llamalend/queries/market-list/lending-vaults'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { getUserMintMarketsStatsOptions } from '@/llamalend/queries/market-list/mint-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { splitAt, zip } from '@primitives/array.utils'
import type { Amount } from '@primitives/decimal.utils'
import { useQueries, type UseQueryResult } from '@tanstack/react-query'
import { t } from '@ui-kit/lib/i18n'
import { getTokenUsdRateQueryOptions } from '@ui-kit/lib/model/entities/token-usd-rate'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { type QueryOptionsData } from '@ui-kit/lib/queries/types'
import { MarketType } from '@ui-kit/types/market'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { requireChainId } from '@ui-kit/utils'

export type UserPositionSummaryMetric = { label: string; metric: QueryProp<Amount> }

type LendBorrowStatsData = QueryOptionsData<ReturnType<typeof getUserLendingVaultStatsOptions>>
type MintBorrowStatsData = QueryOptionsData<ReturnType<typeof getUserMintMarketsStatsOptions>>
type BorrowStatsData = LendBorrowStatsData | MintBorrowStatsData
type TokenPrice = number

type TokenPriceEntry = { chainId: number; tokenAddress: Address }

const MISSING_PRICE_RESULT: TokenPrice = 0
const getTokenPriceEntryKey = ({ chainId, tokenAddress }: TokenPriceEntry) => `${chainId}:${tokenAddress.toLowerCase()}`
const createUniqueTokenPriceEntries = (entries: TokenPriceEntry[]) => uniqBy(entries, getTokenPriceEntryKey)

const createMetric = <T extends Amount>(label: string, metric: QueryProp<T>): UserPositionSummaryMetric => ({
  label,
  metric,
})

const createTokenPriceQueries = (entries: TokenPriceEntry[]) =>
  createUniqueTokenPriceEntries(entries).map(({ chainId, tokenAddress }) =>
    getTokenUsdRateQueryOptions({ chainId, tokenAddress }),
  )

/** Build a token price lookup that hides key formatting. */
const buildGetPrice = (entries: TokenPriceEntry[], priceResults: UseQueryResult<TokenPrice>[]) => {
  const tokenMap = Object.fromEntries(
    createUniqueTokenPriceEntries(entries).map((entry, index) => [
      getTokenPriceEntryKey(entry),
      priceResults[index]?.data,
    ]),
  ) as Record<string, TokenPrice | undefined>
  return (blockchainId: Chain, address: Address) =>
    tokenMap[getTokenPriceEntryKey({ chainId: requireChainId(blockchainId), tokenAddress: address })] ??
    MISSING_PRICE_RESULT
}

const isMintMarketStats = (stats: BorrowStatsData | undefined) => stats && 'stablecoin' in stats

/** Get the amount of borrowed tokens when in soft liquidation.
 * If mint market, return the .stablecoin, if lend market, return the .borrowed */
const getSoftLiquidationBorrowedAmount = (marketType: MarketType, stats: BorrowStatsData | undefined) =>
  marketType === MarketType.Mint && isMintMarketStats(stats)
    ? ((stats as MintBorrowStatsData)?.stablecoin ?? MISSING_PRICE_RESULT)
    : marketType === MarketType.Lend && !isMintMarketStats(stats)
      ? ((stats as LendBorrowStatsData)?.borrowed ?? MISSING_PRICE_RESULT)
      : MISSING_PRICE_RESULT

function useSupplySummary(markets: LlamaMarket[]) {
  // Collect unique token contract addresses to price positions in USD.
  const tokenPriceEntries = useMemo(
    () =>
      markets
        .filter(({ userHasPositions }) => userHasPositions?.Supply)
        .map(({ assets: { borrowed }, chain }) => ({ chainId: requireChainId(chain), tokenAddress: borrowed.address })),
    [markets],
  )

  return useQueries({
    queries: createTokenPriceQueries(tokenPriceEntries),
    combine: priceResults => {
      const getPrice = buildGetPrice(tokenPriceEntries, priceResults)
      return {
        ...combineQueriesMeta(priceResults),
        data: sum(
          markets.map(
            ({ lendingPosition, assets: { borrowed }, chain }) =>
              // Missing USD prices contribute 0 and surface as summary errors
              (lendingPosition?.supplied ?? 0) * getPrice(chain, borrowed.address),
          ),
        ),
      }
    },
  })
}

function useBorrowSummary(markets: LlamaMarket[]) {
  const { address: userAddress } = useConnection()
  const borrowEntries = useMemo(
    () =>
      markets
        .filter(({ userHasPositions }) => userHasPositions?.Borrow)
        .map(({ assets: { borrowed, collateral }, chain, controllerAddress, type }) => ({
          query: { Lend: getUserLendingVaultStatsOptions, Mint: getUserMintMarketsStatsOptions }[type]({
            contractAddress: controllerAddress,
            userAddress,
            blockchainId: chain,
          }),
          blockchainId: chain,
          debtTokenAddress: borrowed.address,
          collateralTokenAddress: collateral.address,
          marketType: type,
        })),
    [markets, userAddress],
  )

  // Collect unique token contract addresses to price positions in USD.
  const tokenPriceEntries = useMemo(
    () =>
      markets
        .filter(({ userHasPositions }) => userHasPositions?.Borrow)
        .flatMap(({ assets: { borrowed, collateral }, chain }) => [
          { chainId: requireChainId(chain), tokenAddress: borrowed.address },
          { chainId: requireChainId(chain), tokenAddress: collateral.address },
        ]),
    [markets],
  )

  return useQueries({
    queries: [...borrowEntries.map(({ query }) => query), ...createTokenPriceQueries(tokenPriceEntries)],
    combine: results => {
      const [positionResults, priceResults] = splitAt(results, borrowEntries?.length ?? 0) as [
        UseQueryResult<BorrowStatsData>[],
        UseQueryResult<TokenPrice>[],
      ]

      const getPrice = buildGetPrice(tokenPriceEntries, priceResults)

      // Missing USD prices contribute 0 and surface as summary errors.
      const data = {
        totalCollateralValue: sum(
          zip(positionResults, borrowEntries).map(
            ([{ data: position }, { blockchainId, collateralTokenAddress, debtTokenAddress, marketType }]) => {
              const collateralValue = (position?.collateral ?? 0) * getPrice(blockchainId, collateralTokenAddress)
              // part of the collateral is converted in the borrowed token when in soft liquidation
              const borrowedAmount = getSoftLiquidationBorrowedAmount(marketType, position)
              const borrowedValue = borrowedAmount * getPrice(blockchainId, debtTokenAddress)
              return collateralValue + borrowedValue
            },
          ),
        ),
        totalBorrowedValue: sum(
          zip(positionResults, borrowEntries).map(
            ([{ data: stat }, { blockchainId, debtTokenAddress }]) =>
              (stat?.debt ?? 0) * getPrice(blockchainId, debtTokenAddress),
          ),
        ),
      }
      return { ...combineQueriesMeta(results), data }
    },
  })
}

/**
 * Summarize user positions into USD totals combining position and price queries together.
 * It separates the borrow/supply query sets, fetches token prices and positions, and aggregates totals.
 * Loading/error states of prices and positions are combined.
 */
export const useUserPositionsSummary = ({
  markets,
}: {
  markets: LlamaMarket[] | undefined
}): UserPositionSummaryMetric[] => {
  const borrowSummary = useBorrowSummary(markets ?? [])
  const supplySummary = useSupplySummary(markets ?? [])
  return [
    createMetric(
      t`Total Collateral`,
      mapQuery(borrowSummary, d => d.totalCollateralValue),
    ),
    createMetric(
      t`Total Borrowed`,
      mapQuery(borrowSummary, d => d.totalBorrowedValue),
    ),
    createMetric(t`Total Supplied`, q(supplySummary)),
  ]
}
