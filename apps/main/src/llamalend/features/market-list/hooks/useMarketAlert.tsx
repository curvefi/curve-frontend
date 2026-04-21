import { useMemo } from 'react'
import { getAddress } from 'viem'
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
    () => controllerAddress && MARKETS_ALERTS[marketType][rChainId]?.[getAddress(controllerAddress)],
    [rChainId, controllerAddress, marketType],
  )
