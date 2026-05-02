import { useCallback } from 'react'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useMappedQuery } from '@ui-kit/types/util'
import { LlamaMarketType } from '@ui-kit/types/market'

type SolvencyMarketParams = {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  marketType: LlamaMarketType
}

/**
 * Returns solvency data for a single llamalend market.
 */
export const useSolvencyMarket = (
  { blockchainId, controllerAddress, marketType }: SolvencyMarketParams,
  enabled = true,
) =>
  useMappedQuery(
    // solvency only computed for lend market, as mint market's solvency is not an user issue
    useLlamaMarket({ blockchainId, controllerAddress }, enabled && marketType === LlamaMarketType.Lend),
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
