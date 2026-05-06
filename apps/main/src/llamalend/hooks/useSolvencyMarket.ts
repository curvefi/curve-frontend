import { useCallback, useMemo } from 'react'
import { isAddressEqual } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import type { QueriesResults } from '@tanstack/react-query'
import { useQueries } from '@tanstack/react-query'
import { RESOLVED_QUERY_RESULT } from '@ui-kit/lib/queries'
import { combineQueriesMeta } from '@ui-kit/lib/queries/combine'
import { LlamaMarketType } from '@ui-kit/types/market'
import { calculateMarketSolvency, createGetBadDebtMarket } from '../llama.utils'
import { getBadDebtLendMarketsOptions } from '../queries/market/market-bad-debt.query'
import { getLendingVaultsOptions } from '../queries/market-list/lending-vaults'

type SolvencyMarketParams = {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  marketType: LlamaMarketType
}

type SolvencyMarketsQueries = [
  ReturnType<typeof getLendingVaultsOptions>,
  ReturnType<typeof getBadDebtLendMarketsOptions>,
]

/**
 * Returns solvency data for a single llamalend market.
 */
export const useSolvencyMarket = ({ blockchainId, controllerAddress }: SolvencyMarketParams, enabled = true) =>
  useQueries({
    queries: useMemo<SolvencyMarketsQueries>(
      // solvency only computed for lend market, as mint market's solvency is not an user issue
      () => [getLendingVaultsOptions({}, enabled), getBadDebtLendMarketsOptions(enabled)],
      [enabled],
    ),
    combine: useCallback(
      (results: QueriesResults<SolvencyMarketsQueries>) => {
        if (!enabled) {
          return RESOLVED_QUERY_RESULT
        }
        const [lendingVaults, badDebtLendMarkets] = results
        const getLendMarketBadDebt = createGetBadDebtMarket(badDebtLendMarkets.data)

        const solvencyMarket =
          blockchainId &&
          controllerAddress &&
          (lendingVaults.data ?? []).find(
            item => item?.chain === blockchainId && isAddressEqual(item.controller, controllerAddress),
          )

        const badDebtUsd = solvencyMarket && getLendMarketBadDebt(solvencyMarket.chain, solvencyMarket.controller)
        const solvencyPercent =
          solvencyMarket &&
          calculateMarketSolvency({
            totalAssetsUsd: solvencyMarket.totalAssetsUsd,
            badDebtUsd,
          })

        return {
          ...combineQueriesMeta(results),
          data:
            solvencyPercent != null && badDebtUsd != null
              ? {
                  solvencyPercent,
                  badDebtUsd,
                }
              : undefined,
        }
      },
      [enabled, blockchainId, controllerAddress],
    ),
  })
