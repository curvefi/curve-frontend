import type { SetState, GetState } from 'zustand'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import createAnalyticsSlice, { AnalyticsSlice } from '@/dao/store/createAnalyticsSlice'
import createAppSlice, { AppSlice } from '@/dao/store/createAppSlice'
import createGasSlice, { GasSlice } from '@/dao/store/createGasSlice'
import createGaugesSlice, { GaugesSlice } from '@/dao/store/createGaugesSlice'
import createProposalsSlice, { ProposalsSlice } from '@/dao/store/createProposalsSlice'
import createUserSlice, { UserSlice } from '@/dao/store/createUserSlice'
import createLockedCrvSlice, { LockedCrvSlice } from './createLockedCrvSlice'

export type State = AppSlice & GasSlice & ProposalsSlice & UserSlice & GaugesSlice & AnalyticsSlice & LockedCrvSlice

const store = (set: SetState<State>, get: GetState<State>): State => ({
  ...createAppSlice(set, get),
  ...createGasSlice(set, get),
  ...createProposalsSlice(set, get),
  ...createGaugesSlice(set, get),
  ...createUserSlice(set, get),
  ...createAnalyticsSlice(set, get),
  ...createLockedCrvSlice(set, get),
})

const useStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)

export default useStore
