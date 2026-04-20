import { useMemo } from 'react'
import { isAddressEqual } from 'viem'
import { DEPRECATED_LLAMAS } from '@/llamalend/llama-markets.constants'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'

export const useDeprecatedMarket = ({
  blockchainId,
  controllerAddress,
}: {
  blockchainId: Chain | undefined
  controllerAddress: Address | undefined
}) =>
  useMemo(() => {
    if (!blockchainId || !controllerAddress) return null

    return (
      Object.entries(DEPRECATED_LLAMAS[blockchainId] ?? {}).find(([address]) =>
        isAddressEqual(address as Address, controllerAddress),
      )?.[1] ?? null
    )
  }, [blockchainId, controllerAddress])
