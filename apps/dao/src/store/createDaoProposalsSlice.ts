import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import cloneDeep from 'lodash/cloneDeep'

import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoading: boolean
  proposals: ProposalData[]
}

const sliceKey = 'daoProposals'

// prettier-ignore
export type DaoProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(curve: CurveApi): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalsLoading: false,
  proposals: [],
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createDaoProposalsSlice = (set: SetState<State>, get: GetState<State>): DaoProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getProposals: async (curve: CurveApi) => {
      set(
        produce((state: State) => {
          state.daoProposals.proposalsLoading = true
        })
      )

      try {
        const proposals = await curve.dao.getProposalList()

        set(
          produce((state: State) => {
            state.daoProposals.proposals = proposals
            state.daoProposals.proposalsLoading = false
          })
        )
      } catch (error) {
        console.log(error)
      }
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createDaoProposalsSlice
