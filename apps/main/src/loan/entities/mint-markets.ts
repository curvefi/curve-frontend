import { useMemo } from 'react'
import { isAddress } from 'viem'
import { ChainId } from '@/loan/types/loan.types'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import { useConnection } from '@ui-kit/features/connect-wallet'
import type { Address } from '@ui-kit/utils'

/**
 * Hook to get a mapping of mint market controller address to market name for all mint markets on a specific chain.
 * Primarily useful fetching mint markets via URL.
 */
export const useMintMarketMapping = ({ chainId }: { chainId: ChainId | undefined }) => {
  const { llamaApi: api } = useConnection()
  const mapping = useMemo(
    () =>
      api?.hydrated &&
      chainId &&
      fromEntries(api.mintMarkets.getMarketList().map((name) => [api.getMintMarket(name).controller as Address, name])),
    // Need to specifically watch to api?.hydrated, as simply watching api as a whole won't trigger when hydrated is set to true by `useHydration`
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api?.hydrated, chainId],
  )

  return mapping || undefined
}

/**
 * Hook to get a specific mint market by its id or controller address.
 * @param chainId The chain for which to get the mint market of
 * @param marketId Mint market id or controller address
 * @returns The market instance, if found.
 */
export const useMintMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string | Address }) => {
  const marketMapping = useMintMarketMapping({ chainId })
  const { llamaApi: api } = useConnection()

  return useMemo(() => {
    if (!api) return undefined

    // If markets aren't found they throw an error, but we want to return undefined instead
    const safeGetMarket = (id: string) => {
      try {
        return api.getMintMarket(id)
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
