import { type GetAndSet, useStoredState } from './useStoredState'

const storedValues = new Map<string, unknown>()
const get = <T>(key: string, initialValue?: T) =>
  storedValues.has(key) ? (storedValues.get(key) as T) : (initialValue as T)
const set = <T>(key: string, value: T) => (value == null ? storedValues.delete(key) : storedValues.set(key, value))

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 *
 * It is not exported, as we want to keep an overview of all the local keys used in the app.
 */
export const useGlobalState = <T>(key: string, initialValue: T): GetAndSet<T> =>
  useStoredState({ key, initialValue, get, set })
