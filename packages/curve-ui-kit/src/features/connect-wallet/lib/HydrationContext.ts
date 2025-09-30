import { Context, createContext, useContext } from 'react'
import { LibKey, Libs } from '@ui-kit/features/connect-wallet/lib/types'

type HydrationContextValue<K extends LibKey> = {
  api?: Libs[K] /* an instance of the lib that's hydrated */
}

const HydrationContexts = {
  llamaApi: createContext<HydrationContextValue<'llamaApi'>>({}),
  curveApi: createContext<HydrationContextValue<'curveApi'>>({}),
}

export const getHydrationContext = <K extends LibKey>(libKey: K) =>
  HydrationContexts[libKey] as unknown as Context<HydrationContextValue<K>>

export const useHydrationContext = <K extends LibKey>(libKey: K) => useContext(getHydrationContext(libKey))
