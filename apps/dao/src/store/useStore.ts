import type { SetState, GetState } from 'zustand'

import { devtools, persist } from 'zustand/middleware'
import create from 'zustand'
import merge from 'lodash/merge'

import createGlobalSlice, { GlobalSlice } from '@/store/createGlobalSlice'
import createCacheSlice, { CacheSlice } from '@/store/createCacheSlice'
import createGasSlice, { GasSlice } from '@/store/createGasSlice'
import createWalletSlice, { WalletSlice } from '@/store/createWalletSlice'
import createProposalsSlice, { ProposalsSlice } from '@/store/createProposalsSlice'
import createUserSlice, { UserSlice } from '@/store/createUserSlice'
import createGaugesSlice, { GaugesSlice } from '@/store/createGaugesSlice'

export type State = GlobalSlice & CacheSlice & GasSlice & WalletSlice & ProposalsSlice & UserSlice & GaugesSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createGlobalSlice(set, get),
  ...createGasSlice(set, get),
  ...createCacheSlice(set, get),
  ...createWalletSlice(set, get),
  ...createProposalsSlice(set, get),
  ...createGaugesSlice(set, get),
  ...createUserSlice(set, get),
})

// cache all items in CacheSlice store
const cache = {
  name: 'dao-app-store-cache',
  partialize: (state: State) => {
    return Object.fromEntries(
      Object.entries(state).filter(([key]) => {
        return ['storeCache'].includes(key)
      })
    )
  },
  merge: (persistedState: State, currentState: State) => merge(persistedState, currentState),
  version: 1, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development'
    ? create<State>(devtools(persist(store, cache)))
    : create<State>(persist(store, cache))
// const useStore = isDevelopment ? create(devtools(store)) : create(store)

export default useStore
