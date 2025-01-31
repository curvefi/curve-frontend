import type { SetState, GetState } from 'zustand'
import type { PersistOptions } from 'zustand/middleware/persist'

import { devtools, persist } from 'zustand/middleware'
import { create } from 'zustand'
import merge from 'lodash/merge'

import createAppSlice, { AppSlice } from '@/dao/store/createAppSlice'
import createCacheSlice, { CacheSlice } from '@/dao/store/createCacheSlice'
import createGasSlice, { GasSlice } from '@/dao/store/createGasSlice'
import createProposalsSlice, { ProposalsSlice } from '@/dao/store/createProposalsSlice'
import createUserSlice, { UserSlice } from '@/dao/store/createUserSlice'
import createGaugesSlice, { GaugesSlice } from '@/dao/store/createGaugesSlice'
import createAnalyticsSlice, { AnalyticsSlice } from '@/dao/store/createAnalyticsSlice'
import createTokensSlice, { TokensSlice } from './createTokensSlice'
import createLockedCrvSlice, { LockedCrvSlice } from './createLockedCrvSlice'
import createUsdRatesSlice, { UsdRatesSlice } from './createUsdRatesSlice'
import createLayoutSlice, { AppLayoutSlice } from './createLayoutSlice'

export type State = AppSlice &
  CacheSlice &
  GasSlice &
  ProposalsSlice &
  UserSlice &
  GaugesSlice &
  AnalyticsSlice &
  TokensSlice &
  LockedCrvSlice &
  UsdRatesSlice &
  AppLayoutSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createAppSlice(set, get),
  ...createGasSlice(set, get),
  ...createCacheSlice(set, get),
  ...createProposalsSlice(set, get),
  ...createGaugesSlice(set, get),
  ...createUserSlice(set, get),
  ...createAnalyticsSlice(set, get),
  ...createTokensSlice(set, get),
  ...createLockedCrvSlice(set, get),
  ...createUsdRatesSlice(set, get),
  ...createLayoutSlice(set, get),
})

const cache: PersistOptions<State, Pick<State, 'storeCache'>> = {
  name: 'dao-app-store-cache',
  partialize: ({ storeCache }: State) => ({ storeCache }),
  // @ts-ignore
  merge: (persistedState, currentState) => merge(persistedState, currentState),
  version: 2, // update version number to prevent UI from using cache
}

const useStore =
  process.env.NODE_ENV === 'development' ? create(devtools(persist(store, cache))) : create(persist(store, cache))

export default useStore
