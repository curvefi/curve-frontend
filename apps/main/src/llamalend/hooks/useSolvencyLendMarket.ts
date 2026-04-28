import { useCallback } from 'react'
import { useLlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { useMappedQuery } from '@ui-kit/types/util'

type BadDebtParams = {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}

/**
 * Returns solvency data for a single lend market.
 */
export const useSolvencyLendMarket = ({ blockchainId, controllerAddress }: BadDebtParams) =>
  useMappedQuery(
    useLlamaMarket({ blockchainId, controllerAddress }, !!blockchainId && !!controllerAddress),
    useCallback(
      (market) =>
        market.type === LlamaMarketType.Lend && market.solvencyPercent != null
          ? {
              solvencyPercent: market.solvencyPercent,
              badDebtUsd: market.badDebtUsd as number,
            }
          : undefined,
      [],
    ),
  )
