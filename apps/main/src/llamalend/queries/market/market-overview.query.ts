import { useCallback, useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { combineQueryState } from '@evm-ui/lib/queries/combine'
import { MarketType } from '@evm-ui/types/market'
import { q } from '@evm-ui/types/util'
import { TIME_FRAMES } from '@evm-ui/utils'
import { isAddressEqual, type Address } from '@primitives/address.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { getLendingVaultsOptions } from '../market-list/lending-vaults'
import { getMintMarketOptions } from '../market-list/mint-markets'

type OverviewQueries = [ReturnType<typeof getLendingVaultsOptions>, ReturnType<typeof getMintMarketOptions>]

/** Returns overview stats a market page. */
export const useMarketOverview = ({
  blockchainId,
  controllerAddress,
  marketType,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  marketType: MarketType
}) =>
  q(
    useQueries({
      queries: useMemo<OverviewQueries>(
        () => [
          getLendingVaultsOptions({}, marketType === MarketType.Lend),
          getMintMarketOptions({}, marketType === MarketType.Mint),
        ],
        [marketType],
      ),
      combine: useCallback(
        (results: QueriesResults<OverviewQueries>) => {
          const [lendingVaults, mintMarkets] = results
          const marketOverview = maybes([blockchainId, controllerAddress], (blockchainId, controllerAddress) =>
            marketType === MarketType.Lend
              ? maybe(
                  lendingVaults.data?.find(
                    item => item.chain === blockchainId && isAddressEqual(item.controller, controllerAddress),
                  ),
                  ({ createdAt, nLoans }) => ({ createdAt, totalBorrowers: nLoans }),
                )
              : maybe(
                  mintMarkets.data?.find(
                    item => item.chain === blockchainId && isAddressEqual(item.address, controllerAddress),
                  ),
                  ({ createdAt, loans }) => ({ createdAt, totalBorrowers: loans }),
                ),
          )

          return {
            ...combineQueryState(...results),
            data: maybe(marketOverview, ({ createdAt, totalBorrowers }) => ({
              deployedDays: Math.floor((Date.now() - createdAt) / TIME_FRAMES.DAY_MS),
              totalBorrowers,
            })),
          }
        },
        [blockchainId, controllerAddress, marketType],
      ),
    }),
  )
