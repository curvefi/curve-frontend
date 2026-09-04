import { createContext, use } from 'react'
import { assert } from '@primitives/objects.utils'
import type { PoolContextValue } from './PoolContextValue'

export const PoolContext = createContext<PoolContextValue | undefined>(undefined)

export const usePoolContext = () => assert(use(PoolContext), 'usePoolContext must be used within PoolContextProvider')
