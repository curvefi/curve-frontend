import { useMemo } from 'react'
import { DEPRECATED_LLAMAS } from '@/llamalend/markets.constants'
import type { Chain } from '@curvefi/prices-api'
import type { MarketType } from '@evm-ui/types/market'
import { isAddressEqual, type Address } from '@primitives/address.utils'
import { maybes, recordEntries } from '@primitives/objects.utils'

export const useDeprecatedMarket = ({
  blockchainId,
  controllerAddress,
  marketType,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
  marketType: MarketType | undefined
}) =>
  useMemo(
    () =>
      maybes(
        [blockchainId, controllerAddress, marketType],
        (blockchainId, controllerAddress, marketType) =>
          recordEntries(DEPRECATED_LLAMAS[marketType][blockchainId] ?? {}).find(([address]) =>
            isAddressEqual(address, controllerAddress),
          )?.[1],
      ),
    [blockchainId, controllerAddress, marketType],
  ) ?? null
