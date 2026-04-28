import { useCallback } from 'react'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { useMappedQuery } from '@ui-kit/types/util'

type BadDebtParams = {
  type: LlamaMarketType
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

/**
 * Returns solvency and insolvency data for a single lend market.
 */
export const useSolvencyMarket = ({ type, blockchainId, controllerAddress }: BadDebtParams) => {
  // solvency is only relevant for lending markets; if mint markets have bad debt that's a protocol problem, not a user problem
  const enabled = !!blockchainId && !!controllerAddress && type === LlamaMarketType.Lend
  return useMappedQuery(
    useLlamaMarket({ blockchainId, controllerAddress }, enabled),
    useCallback(
      (market) =>
        market.type === LlamaMarketType.Lend && market.solvencyPercent
          ? {
              solvencyPercent: market.solvencyPercent,
              badDebtUsd: market.badDebtUsd,
              marketType: market.type,
            }
          : undefined,
      [],
    ),
  )
}
