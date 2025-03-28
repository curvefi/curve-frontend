import { create, type StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'
import type curveApi from '@curvefi/api'
import type llamalendApi from '@curvefi/llamalend-api'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { Chain } from '@ui-kit/utils'

export type CurveApi = typeof curveApi & { chainId: number }
export type LlamalendChainId = IChainId | Chain.Sonic // todo: sonic should be part of IChainId
export type LlamalendApi = typeof llamalendApi & { chainId: LlamalendChainId }

type State = {
  curve: CurveApi | null
  isLoadingCurve: boolean
  llamalend: LlamalendApi | null
  isLoadingLlamalend: boolean
}

type Action = {
  updateCurve: (curveApi: CurveApi) => void
  setIsLoadingCurve: (isLoading: boolean) => void

  updateLlamalend: (lendingApi: LlamalendApi) => void
  setIsLoadingLlamalend: (isLoading: boolean) => void
}

type Store = State & Action

const INITIAL_STATE: State = {
  curve: null,
  isLoadingCurve: true,
  llamalend: null,
  isLoadingLlamalend: true,
}

const store: StateCreator<Store> = (set) => ({
  ...INITIAL_STATE,
  updateCurve: (curve) => set({ curve }),
  setIsLoadingCurve: (isLoadingCurve) => set({ isLoadingCurve }),
  updateLlamalend: (lending) => set({ llamalend: lending }),
  setIsLoadingLlamalend: (isLoadingLlamalend) => set({ isLoadingLlamalend }),
})

/**
 * Store for managing Curve API instances
 * This store provides access to different Curve API instances (curve, lending, stable)
 * and tracks their loading states.
 */
export const useApiStore = process.env.NODE_ENV === 'development' ? create(devtools(store)) : create(store)
