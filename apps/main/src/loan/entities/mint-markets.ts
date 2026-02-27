import { useMemo } from 'react'
import { isAddress } from 'viem'
import { ChainId } from '@/loan/types/loan.types'
import type { Address } from '@primitives/address.utils'
import { fromEntries } from '@primitives/objects.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'

/**
 * Hook to get a mapping of mint market controller address to market name for all mint markets on a specific chain.
 * Primarily useful fetching mint markets via URL.
 */
export const useMintMarketMapping = ({ chainId }: { chainId: ChainId | undefined }) => {
  const { llamaApi: api } = useCurve()

  return useMemo(
    () =>
      api &&
      chainId &&
      fromEntries(api.mintMarkets.getMarketList().map((name) => [api.getMintMarket(name).controller as Address, name])),
    [api, chainId],
  )
}

/**
 * Hook to get a specific mint market by its id or controller address.
 * @param chainId The chain for which to get the mint market of
 * @param marketId Mint market id or controller address
 * @returns The market instance, if found.
 */
export const useMintMarket = ({ chainId, marketId }: { chainId: ChainId; marketId: string | Address }) => {
  const mintMarketMapping = useMintMarketMapping({ chainId })
  const { llamaApi: api } = useCurve()

  return useMemo(() => {
    try {
      return api && mintMarketMapping && api.getMintMarket(isAddress(marketId) ? mintMarketMapping[marketId] : marketId)
    } catch (e) {
      console.warn(e) // bad urls should not crash the page, a 404 page will be displayed
    }
  }, [api, marketId, mintMarketMapping])
}
