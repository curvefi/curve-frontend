import { type GetAndSet, useStoredState } from './useStoredState'

const storedValues = new Map<string, unknown>()

const get = <Type, Default = Type>(key: string, initialValue?: Default) =>
  storedValues.has(key) ? (storedValues.get(key) as Type) : (initialValue as Default)
const set = <Type, Default = Type>(key: string, value: Type | Default) =>
  value == null ? storedValues.delete(key) : storedValues.set(key, value)

/**
 * A hook to use local storage with a key and an initial value.
 * Similar to useState, but persists the value in local storage.
 *
 * It is not exported, as we want to keep an overview of all the local keys used in the app.
 */
export const useGlobalState = <Type, Default = Type>(key: string, initialValue?: Default): GetAndSet<Type, Default> =>
  useStoredState({
    key,
    initialValue,
    get,
    set,
  })
