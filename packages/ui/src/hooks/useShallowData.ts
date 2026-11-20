import { identity } from 'lodash'
import { useShallow } from 'zustand/react/shallow'

export const useShallowData = <T>(data: T) => useShallow(identity<T>)(data)
