import { useMemo } from 'react'
import { type Chain, LEND_CHAINS, MINT_CHAINS } from '@curvefi/prices-api'
import { combineQueryState } from '@evm-ui/lib'
import { MarketRateType, MarketType } from '@evm-ui/types/market'
import type { Query } from '@evm-ui/types/util'
import type { Address } from '@primitives/address.utils'
import { splitArrayTuple, zip } from '@primitives/array.utils'
import { fromEntries, notFalsy, type PartialRecord, recordValues } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
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

const groupAddressesByChain = (queries: Query<Address[]>[], chains: Chain[]) =>
  [
    fromEntries(
      notFalsy(...zip(chains, queries).map(([chain, { data }]) => data && ([chain, new Set(data)] as const))),
    ),
    queries.some(({ data }) => data?.length),
  ] as const

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

      const [userBorrows, hasBorrowed] = groupAddressesByChain(userLendingVaults, LEND_CHAINS)
      const [userMints, hasMinted] = groupAddressesByChain(userMintMarkets, MINT_CHAINS)
      const userSuppliesByChain = fromEntries(
        zip(LEND_CHAINS, userSuppliedMarkets).flatMap(([chain, { data }]) => (data == null ? [] : [[chain, data]])),
      )
      const hasSupplied = userSuppliedMarkets.some(query => recordValues(query.data ?? {}).length)
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
