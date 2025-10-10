import { create, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import createAnalyticsSlice, { AnalyticsSlice } from '@/dao/store/createAnalyticsSlice'
import createAppSlice, { AppSlice } from '@/dao/store/createAppSlice'
import createGaugesSlice, { GaugesSlice } from '@/dao/store/createGaugesSlice'
import createProposalsSlice, { ProposalsSlice } from '@/dao/store/createProposalsSlice'
import createUserSlice, { UserSlice } from '@/dao/store/createUserSlice'
import createLockedCrvSlice, { LockedCrvSlice } from './createLockedCrvSlice'

export type State = AppSlice & ProposalsSlice & UserSlice & GaugesSlice & AnalyticsSlice & LockedCrvSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createAppSlice(set, get),
  ...createProposalsSlice(set, get),
  ...createGaugesSlice(set, get),
  ...createUserSlice(set, get),
  ...createAnalyticsSlice(set, get),
  ...createLockedCrvSlice(set, get),
})

const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)

export default useStore
