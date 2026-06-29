import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { DEPRECATED_LLAMAS } from '@/llamalend/llama-markets.constants'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { maybes, recordEntries } from '@primitives/objects.utils'
import type { LlamaMarketType } from '@ui-kit/types/market'

export const useDeprecatedMarket = ({
  blockchainId,
  controllerAddress,
  marketType,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  marketType: LlamaMarketType | undefined
}) =>
  useMemo(
    () =>
      maybes(
        [blockchainId, controllerAddress, marketType],
        ([blockchainId, controllerAddress, marketType]) =>
          recordEntries(DEPRECATED_LLAMAS[marketType][blockchainId] ?? {}).find(([address]) =>
            isAddressEqual(address, controllerAddress),
          )?.[1],
      ),
    [blockchainId, controllerAddress, marketType],
  ) ?? null
