import { useEffect, useRef, useState } from 'react'
import { useConnection, type Wallet } from '@ui-kit/features/connect-wallet'
import type { LibKey, Libs } from '@ui-kit/features/connect-wallet/lib/types'
import { isWalletMatching } from '@ui-kit/features/connect-wallet/lib/utils'

/**
 * Hook to hydrate a specific library in the connection context.
 * It will call the provided hydrate function with the current library and previous library state.
 * The hydration will only happen once per library key unless chainId or signerAddress changes.
 */
export const useHydration = <K extends LibKey, ChainId extends number>(
  libKey: K,
  hydrate: (lib: Libs[K], prevLib: Libs[K], wallet?: Wallet) => Promise<void>,
  chainId: ChainId,
) => {
  const [hydrated, setHydrated] = useState(false)
  const connection = useConnection()
  const { wallet } = connection
  const prev = useRef<Libs[K]>(undefined)
  const lib = connection[libKey]

  useEffect(() => {
    if (lib && !isWalletMatching(wallet, lib, chainId)) {
      return
    }

    const abort = new AbortController()
    void (async () => {
      try {
        setHydrated(false)
        // todo: keep hydration when switching apps, only hydrate when wallet/chain changes
        await hydrate(lib, prev.current, wallet)
      } catch (error) {
        console.error(`Error during ${libKey} hydration`, error)
      } finally {
        if (!abort.signal.aborted) {
          setHydrated(true)
        }
      }
    })()
    return () => abort.abort()
  }, [chainId, hydrate, lib, libKey, wallet])

  useEffect(() => {
    prev.current = lib
  }, [lib])

  return hydrated
}
