import { useCallback, useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { maybe } from '@primitives/objects.utils'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { MarketType } from '@ui-kit/types/market'
import { q } from '@ui-kit/types/util'
import { TIME_FRAMES } from '@ui-kit/utils'
import { getLendingVaultsOptions } from '../market-list/lending-vaults'
import { getMintMarketOptions } from '../market-list/mint-markets'

type DeploymentQueries = [ReturnType<typeof getLendingVaultsOptions>, ReturnType<typeof getMintMarketOptions>]

/** Returns the number of full days since a market was deployed, using the cached Prices API market lists. */
export const useMarketDeployedDays = ({
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
      queries: useMemo<DeploymentQueries>(
        () => [
          getLendingVaultsOptions({}, marketType === MarketType.Lend),
          getMintMarketOptions({}, marketType === MarketType.Mint),
        ],
        [marketType],
      ),
      combine: useCallback(
        (results: QueriesResults<DeploymentQueries>) => {
          const [lendingVaults, mintMarkets] = results
          const deployedMarket =
            blockchainId &&
            controllerAddress &&
            (marketType === MarketType.Lend
              ? lendingVaults.data?.find(
                  item => item.chain === blockchainId && isAddressEqual(item.controller, controllerAddress),
                )
              : mintMarkets.data?.find(
                  item => item.chain === blockchainId && isAddressEqual(item.address, controllerAddress),
                ))

          return {
            ...combineQueriesMeta(results),
            data: maybe(deployedMarket?.createdAt, createdAt =>
              Math.floor((Date.now() - createdAt) / TIME_FRAMES.DAY_MS),
            ),
          }
        },
        [blockchainId, controllerAddress, marketType],
      ),
    }),
  )
