import { useCallback } from 'react'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useMappedQuery } from '@ui-kit/types/util'

type SolvencyMarketParams = {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

/**
 * Returns solvency data for a single llamalend market.
 */
export const useSolvencyMarket = ({ blockchainId, controllerAddress }: SolvencyMarketParams, enabled = true) =>
  useMappedQuery(
    useLlamaMarket({ blockchainId, controllerAddress }, enabled),
    useCallback(
      market =>
        market.solvencyPercent != null
          ? {
              solvencyPercent: market.solvencyPercent,
              badDebtUsd: market.badDebtUsd!,
            }
          : undefined,
      [],
    ),
  )
