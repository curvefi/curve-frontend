import { useMemo } from 'react'
import { MARKETS_ALERTS } from '@/llamalend/llama-markets.constants'
import { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Address } from '@primitives/address.utils'
import { LlamaMarketType } from '@ui-kit/types/market'

export const useMarketAlert = <ChainId extends IChainId>(
  rChainId: ChainId,
  controllerAddress: Address | undefined,
  marketType: LlamaMarketType,
) =>
  useMemo(
    () =>
      controllerAddress &&
      MARKETS_ALERTS[marketType][rChainId]?.[
        // we have tests to be sure that all controller addresses of the alerts are lowercase
        controllerAddress.toLowerCase() as Address
      ],
    [rChainId, controllerAddress, marketType],
  )
