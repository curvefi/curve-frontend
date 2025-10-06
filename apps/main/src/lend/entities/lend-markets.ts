import { useMemo } from 'react'
import { isAddress } from 'viem'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import { useConnection } from '@ui-kit/features/connect-wallet'
import type { Address } from '@ui-kit/utils'

/**
 * Hook to get a mapping of lending market controller address to market name for all lending markets on a specific chain.
 * Primarily useful fetching lending markets via URL.
 */
export const useLendMarketMapping = ({ chainId }: { chainId: ChainId | undefined }) => {
  const { llamaApi: api } = useConnection()
  const mapping = useMemo(
    () =>
      api?.hydrated &&
      chainId &&
      fromEntries(
        api.lendMarkets
          .getMarketList()
          .filter((marketName) => !networks[chainId].hideMarketsInUI[marketName])
          .map((name) => [api.getLendMarket(name).addresses.controller as Address, name]),
      ),
    // Need to specifically watch to api?.hydrated, as simply watching api as a whole won't trigger when hydrated is set to true by `useHydration`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api?.hydrated, chainId],
  )

  return mapping || undefined
}

/**
 * Hook to get a specific lending market by its id or controller address.
 * @param chainId The chain for which to get the lending market of
 * @param marketId Lend market id or controller address
 * @returns The market instance, if found.
 */
export const useLendMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string | Address }) => {
  const marketMapping = useLendMarketMapping({ chainId })
  const { llamaApi: api } = useConnection()

  return useMemo(() => {
    if (!api) return undefined

    // If markets aren't found they throw an error, but we want to return undefined instead
    const safeGetMarket = (id: string) => {
      try {
        return api.getLendMarket(id)
      } catch {
        return undefined
      }
    }

    // Try to get the market by name first
    if (!isAddress(marketId)) return safeGetMarket(marketId)

    // Try to get by controller address mapping
    return marketMapping && marketId in marketMapping && api.hydrated && api.chainId === chainId
      ? safeGetMarket(marketMapping[marketId])
      : undefined
  }, [api, chainId, marketId, marketMapping])
}
