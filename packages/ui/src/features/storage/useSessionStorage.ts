import type { Address } from '@primitives/address.utils'
import { type MigrationOptions, useStoredState } from '@ui/features/storage/useStoredState'

const get = <T>(key: string, initialValue: T): T =>
  (JSON.parse(sessionStorage.getItem(key) ?? 'null') as T | null) ?? initialValue

const set = <T>(key: string, value: T) => {
  if (value == null) return sessionStorage.removeItem(key)
  sessionStorage.setItem(key, JSON.stringify(value))
}

// Keep storage keys in the specific exported hooks, as with useLocalStorage.
const useSessionStorage = <T>(key: string, initialValue: T, migration?: MigrationOptions<T>) =>
  useStoredState<T>({ key, initialValue, get, set, ...migration })

const EMPTY_CREATED_POOLS: Address[] = []

export const useCreatedPools = (networkId: string) =>
  useSessionStorage<Address[]>(`created-pools-${networkId}`, EMPTY_CREATED_POOLS)
