import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'

import { shortenTokenAddress } from '@/ui/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  gaugesLoading: boolean
  gaugeMapper: PricesGaugeOverviewData[]
  pieData: PieData[]
}

const sliceKey = 'gauges'

// prettier-ignore
export type GaugesSlice = {
  [sliceKey]: SliceState & {
    getGauges(curve: CurveApi): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  gaugesLoading: true,
  gaugeMapper: [],
  pieData: [],
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createGaugesSlice = (set: SetState<State>, get: GetState<State>): GaugesSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getGauges: async (curve: CurveApi) => {
      try {
        get().setAppStateByKey(sliceKey, 'gaugesLoading', true)

        const gauges = await fetch('https://prices.curve.fi/v1/dao/gauges/overview')
        const formattedGauges: PricesGaugeOverviewResponse = await gauges.json()

        console.log('formattedGauges', formattedGauges.gauges)

        const pieData = formattedGauges.gauges
          .filter((gauge) => gauge.gauge_relative_weight > 0)
          .map((gauge) => ({
            name: gauge.name,
            address: gauge.address,
            title: gauge.pool?.name
              ? gauge.pool.name.split(': ')[1] || gauge.pool.name
              : shortenTokenAddress(gauge.address),
            gauge_relative_weight: +(gauge.gauge_relative_weight * 100).toFixed(4),
            gauge_weight_7d_delta:
              gauge.gauge_weight_7d_delta != null ? +(gauge.gauge_weight_7d_delta * 100).toFixed(4) : null,
            gauge_weight_60d_delta:
              gauge.gauge_weight_60d_delta != null ? +(gauge.gauge_weight_60d_delta * 100).toFixed(4) : null,
          }))
        // .sort((a, b) => b.gauge_relative_weight - a.gauge_relative_weight)

        console.log('pieData', pieData)

        get().setAppStateByKey(sliceKey, 'gaugeMapper', formattedGauges.gauges)
        get().setAppStateByKey(sliceKey, 'pieData', pieData)
        get().setAppStateByKey(sliceKey, 'gaugesLoading', false)
      } catch (error) {
        console.log(error)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

const convertNumber = (number: number) => {
  return number / 10 ** 18
}

const searchFn = (filterValue: string, proposals: ProposalData[]) => {
  const fuse = new Fuse<ProposalData>(proposals, {
    ignoreLocation: true,
    threshold: 0.3,
    includeScore: true,
    keys: [
      'voteId',
      'creator',
      'voteType',
      {
        name: 'metaData',
        getFn: (proposal) => {
          // Preprocess the metaData field
          const metaData = proposal.metadata || ''
          return metaData.toLowerCase()
        },
      },
    ],
  })

  const result = fuse.search(filterValue, { limit: 10 })

  console.log('result', result)

  return result.map((r) => r.item)
}

export default createGaugesSlice
