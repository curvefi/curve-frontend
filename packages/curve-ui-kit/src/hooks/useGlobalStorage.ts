import type { Wallet } from '@ui-kit/features/connect-wallet/lib/types'
import { type GetAndSet, useStorage } from './useStorage'

const storedValues = new Map<string, unknown>()

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 *
 * It is not exported, as we want to keep an overview of all the local keys used in the app.
 */
const useGlobalStorage = <Type, Default = Type>(key: string, initialValue?: Default): GetAndSet<Type, Default> =>
  useStorage({
    key,
    initialValue,
    get: (key: string, initialValue?: Default) =>
      storedValues.has(key) ? (storedValues.get(key) as Type) : (initialValue as Default),
    set: (key: string, value: Type | Default) =>
      value == null ? storedValues.delete(key) : storedValues.set(key, value),
  })

export const useIsWalletConnecting = () => useGlobalStorage<boolean>('isWalletConnecting', false)
export const useIsWalletModalOpen = () => useGlobalStorage<boolean>('isWalletModalOpen', false)
export const useWalletStorage = () => useGlobalStorage<Wallet, null>('wagmiWallet', null)
