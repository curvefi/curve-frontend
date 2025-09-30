import { ReactNode, useEffect, useRef, useState } from 'react'
import { getHydrationContext } from '@ui-kit/features/connect-wallet/lib/HydrationContext'
import { useConnection } from './ConnectionContext'
import { type Wallet } from './types'
import type { LibKey, Libs } from './types'
import { isWalletMatching } from './utils'

/**
 * Provider that hydrates a specific library in the connection context.
 * It will call the provided hydrate function with the current library and previous library state.
 * The hydration will only happen once per library key unless chainId or signerAddress changes.
 */
export const HydrationProvider = <K extends LibKey, ChainId extends number>({
  libKey,
  chainId,
  hydrate,
  children,
}: {
  libKey: K
  hydrate: (lib: Libs[K], prevLib: Libs[K], wallet?: Wallet) => Promise<void>
  chainId: ChainId | undefined // temporarily undefined when network isn't found & user is being redirected
  children: ReactNode
}) => {
  const [hydrated, setHydrated] = useState<Libs[K]>()
  const connection = useConnection()
  const { wallet } = connection
  const prev = useRef<Libs[K]>(undefined)
  const lib = connection[libKey]

  useEffect(() => {
    if (lib && !isWalletMatching(wallet, lib, chainId)) {
      return setHydrated(undefined)
    }

    const abort = new AbortController()
    void (async () => {
      try {
        // todo: keep hydration when switching apps, only hydrate when wallet/chain changes
        await hydrate(lib, prev.current, wallet)
      } catch (error) {
        console.error(`Error during ${libKey} hydration`, error)
      } finally {
        if (!abort.signal.aborted) {
          setHydrated(lib)
        }
      }
    })()
    return () => abort.abort()
  }, [chainId, hydrate, lib, libKey, wallet])

  useEffect(() => {
    prev.current = lib
  }, [lib])

  const { Provider } = getHydrationContext(libKey)
  return <Provider value={{ api: hydrated }}>{children}</Provider>
}
