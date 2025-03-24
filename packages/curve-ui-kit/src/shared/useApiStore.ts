import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import type curveApi from '@curvefi/api'

export type CurveApi = typeof curveApi & { chainId: 1 }

type State = {
  curve: CurveApi | null
  isLoadingCurve: boolean
}

type Action = {
  updateCurve: (curveApi: CurveApi) => void
  setIsLoadingCurve: (isLoading: boolean) => void
}

type Store = State & Action

const INITIAL_STATE: State = {
  curve: null,
  isLoadingCurve: true,
}

const store: StateCreator<Store> = (set) => ({
  ...INITIAL_STATE,
  updateCurve: (curve) => set({ curve }),
  setIsLoadingCurve: (isLoadingCurve) => set({ isLoadingCurve }),
})

export const useApiStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
