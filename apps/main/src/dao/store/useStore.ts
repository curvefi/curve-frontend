import { create, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { AnalyticsSlice, createAnalyticsSlice } from '@/dao/store/createAnalyticsSlice'
import { AppSlice, createAppSlice } from '@/dao/store/createAppSlice'
import { GaugesSlice, createGaugesSlice } from '@/dao/store/createGaugesSlice'
import { ProposalsSlice, createProposalsSlice } from '@/dao/store/createProposalsSlice'
import { UserSlice, createUserSlice } from '@/dao/store/createUserSlice'
import { LockedCrvSlice, createLockedCrvSlice } from './createLockedCrvSlice'

export type State = AppSlice & ProposalsSlice & UserSlice & GaugesSlice & AnalyticsSlice & LockedCrvSlice

const store = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): State => ({
  ...createAppSlice(set, get),
  ...createProposalsSlice(set, get),
  ...createGaugesSlice(set, get),
  ...createUserSlice(set, get),
  ...createAnalyticsSlice(set, get),
  ...createLockedCrvSlice(set, get),
})

export const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
