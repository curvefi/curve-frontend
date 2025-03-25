import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import type curveApi from '@curvefi/api'
import type lendingApi from '@curvefi/lending-api'
import type { IChainId } from '@curvefi/lending-api/lib/interfaces'
import type stablecoinApi from '@curvefi/stablecoin-api'

export type CurveApi = typeof curveApi & { chainId: 1 }
export type LendingApi = typeof lendingApi & { chainId: IChainId }
export type StableApi = typeof stablecoinApi & { chainId: 1 }

type State = {
  curve: CurveApi | null
  isLoadingCurve: boolean
  lending: LendingApi | null
  isLoadingLending: boolean
  stable: StableApi | null
  isLoadingStable: boolean
}

type Action = {
  updateCurve: (curveApi: CurveApi) => void
  setIsLoadingCurve: (isLoading: boolean) => void

  updateLending: (lendingApi: LendingApi) => void
  setIsLoadingLending: (isLoading: boolean) => void

  updateStable: (stableApi: StableApi) => void
  setIsLoadingStable: (isLoading: boolean) => void
}

type Store = State & Action

const INITIAL_STATE: State = {
  curve: null,
  isLoadingCurve: true,
  lending: null,
  isLoadingLending: true,
  stable: null,
  isLoadingStable: true,
}

const store: StateCreator<Store> = (set) => ({
  ...INITIAL_STATE,
  updateCurve: (curve) => set({ curve }),
  setIsLoadingCurve: (isLoadingCurve) => set({ isLoadingCurve }),
  updateLending: (lending) => set({ lending }),
  setIsLoadingLending: (isLoadingLending) => set({ isLoadingLending }),
  updateStable: (stable) => set({ stable }),
  setIsLoadingStable: (isLoadingStable) => set({ isLoadingStable }),
})

export const useApiStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
