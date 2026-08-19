import { useMemo } from 'react'
import { type Chain, LEND_CHAINS, MINT_CHAINS } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { splitArrayTuple, zip } from '@primitives/array.utils'
import { fromEntries, type PartialRecord, recordValues } from '@primitives/objects.utils'
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
  userBorrows: PartialRecord<Chain, Set<Address>>
  userMints: PartialRecord<Chain, Set<Address>>
  userSuppliesByChain: PartialRecord<Chain, Record<Address, LendingPosition>>
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

      const userBorrows = fromEntries(
        zip(LEND_CHAINS, userLendingVaults).flatMap(([chain, { data }]) => (data ? [[chain, new Set(data)]] : [])),
      )
      const userMints = fromEntries(
        zip(MINT_CHAINS, userMintMarkets).flatMap(([chain, { data }]) => (data ? [[chain, new Set(data)]] : [])),
      )
      const userSuppliesByChain = fromEntries(
        zip(LEND_CHAINS, userSuppliedMarkets).flatMap(([chain, { data }]) => (data ? [[chain, data]] : [])),
      )
      const hasSupplied = userSuppliedMarkets.some(query => recordValues(query.data ?? {}).length)
      const hasBorrowed = recordValues(userBorrows).some(markets => markets.size)
      const hasMinted = recordValues(userMints).some(markets => markets.size)
      const userHasPositions =
        hasBorrowed || hasMinted || hasSupplied
          ? {
              [MarketType.Mint]: {
                [MarketRateType.Borrow]: hasMinted,
                [MarketRateType.Supply]: false,
              },
              [MarketType.Lend]: {
                [MarketRateType.Borrow]: hasBorrowed,
                [MarketRateType.Supply]: hasSupplied,
              },
            }
          : null
      const data: LlamaMarketPositions = { userBorrows, userMints, userSuppliesByChain, userHasPositions }
      return { data, ...combineQueryState(...results) }
    },
  })
