import { useMemo } from 'react'
import { type Chain, LEND_CHAINS, MINT_CHAINS } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { splitArrayTuple } from '@primitives/array.utils'
import { fromEntries, recordValues } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import { combineQueryState } from '@ui-kit/lib'
import { MarketRateType, MarketType } from '@ui-kit/types/market'
import type { Query } from '@ui-kit/types/util'
import {
  getUserLendingSuppliesOptions,
  getUserLendingVaultsOptions,
  type LendingPosition,
  type UserLendingSupplies,
} from './lending-vaults'
import { getUserMintMarketsOptions } from './mint-markets'

export type UserHasPosition = Record<MarketRateType, boolean>
export type UserHasPositions = Record<MarketType, UserHasPosition>

export type LlamaMarketPositions = {
  userBorrows: Set<Address>
  userMints: Set<Address>
  userSuppliesByChain: Partial<Record<Chain, Record<Address, LendingPosition>>>
  userHasPositions: UserHasPositions | null
}

export const useUserLlamaPositions = ({ userAddress }: { userAddress: Address | undefined }, enabled: boolean) =>
  useQueries({
    queries: useMemo(
      () => [
        ...LEND_CHAINS.map(blockchainId => getUserLendingVaultsOptions({ userAddress, blockchainId }, enabled)),
        ...LEND_CHAINS.map(blockchainId => getUserLendingSuppliesOptions({ userAddress, blockchainId }, enabled)),
        ...MINT_CHAINS.map(blockchainId => getUserMintMarketsOptions({ userAddress, blockchainId }, enabled)),
      ],
      [enabled, userAddress],
    ),
    combine: results => {
      const [userLendingVaults, userSuppliedMarkets, userMintMarkets] = splitArrayTuple<
        [Query<Address[]>, Query<UserLendingSupplies>, Query<Address[]>]
      >(results, [LEND_CHAINS, LEND_CHAINS, MINT_CHAINS])

      const userBorrows = new Set(userLendingVaults.flatMap(query => query.data ?? []))
      const userMints = new Set(userMintMarkets.flatMap(query => query.data ?? []))
      const userSuppliesByChain = fromEntries(
        LEND_CHAINS.flatMap((chain, index) => {
          const positions = userSuppliedMarkets[index].data
          return positions ? [[chain, positions]] : []
        }),
      )
      const hasSupplied = userSuppliedMarkets.some(query => recordValues(query.data ?? {}).length)
      const userHasPositions =
        userBorrows.size > 0 || userMints.size > 0 || hasSupplied
          ? {
              [MarketType.Mint]: {
                [MarketRateType.Borrow]: userMints.size > 0,
                [MarketRateType.Supply]: false,
              },
              [MarketType.Lend]: {
                [MarketRateType.Borrow]: userBorrows.size > 0,
                [MarketRateType.Supply]: hasSupplied,
              },
            }
          : null
      const data: LlamaMarketPositions = { userBorrows, userMints, userSuppliesByChain, userHasPositions }
      return { data, ...combineQueryState(...results) }
    },
  })
