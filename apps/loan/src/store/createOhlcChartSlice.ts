import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  ChartType,
  TimeOptions,
  FetchingStatus,
  LpPriceOhlcDataFormatted,
  LlammaOhlcApiResponse,
  VolumeData,
  LlamaBaselinePriceData,
  LlamaOraclePriceData,
} from 'ui/src/Chart/types'
import type { UTCTimestamp } from 'lightweight-charts'

import produce from 'immer'
import { slice } from 'lodash'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  chartOhlcData: LpPriceOhlcDataFormatted[]
  volumeData: VolumeData[]
  oraclePriceData: LlamaOraclePriceData[]
  baselinePriceData: LlamaBaselinePriceData[]
  fetchStatus: FetchingStatus
  timeOption: TimeOptions
  refetchingHistory: boolean
  refetchingCapped: boolean
  lastFetchEndTime: number
  lastRefetchLength: number
}

const sliceKey = 'ohlcCharts'

export type OhlcChartSlice = {
  [sliceKey]: SliceState & {
    setChartTimeOption(timeOption: TimeOptions): void
    fetchOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    fetchMoreOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  chartOhlcData: [],
  volumeData: [],
  oraclePriceData: [],
  baselinePriceData: [],
  fetchStatus: 'LOADING',
  timeOption: '1d',
  refetchingHistory: false,
  refetchingCapped: false,
  lastFetchEndTime: 0,
  lastRefetchLength: 0,
}

const createOhlcChart = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    setChartTimeOption: (timeOption: TimeOptions) => {
      set(
        produce((state: State) => {
          state[sliceKey].timeOption = timeOption
        })
      )
    },
    fetchOhlcData: async (
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].fetchStatus = 'LOADING'
          state[sliceKey].refetchingCapped = DEFAULT_STATE.refetchingCapped
          state[sliceKey].refetchingHistory = DEFAULT_STATE.refetchingHistory
        })
      )
      const network = networks[chainId].id.toLowerCase()

      try {
        const llamaOhlcFetch = await fetch(
          `https://prices.curve.fi/v1/crvusd/llamma_ohlc/${network}/${poolAddress}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const llamaOhlcResponse: LlammaOhlcApiResponse = await llamaOhlcFetch.json()

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: LlamaOraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of llamaOhlcResponse.data) {
          volumeArray = [
            ...volumeArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.volume,
              color: item.open > item.close ? '#26a69982' : '#ef53507e',
            },
          ]

          baselinePriceArray = [
            ...baselinePriceArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              base_price: item.base_price,
            },
          ]

          oraclePriceArray = [
            ...oraclePriceArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              oracle_price: item.oracle_price,
            },
          ]

          ohlcDataArray = [
            ...ohlcDataArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              open: item.open,
              close: item.close,
              high: item.high,
              low: item.low,
            },
          ]

          set(
            produce((state: State) => {
              state[sliceKey].chartOhlcData = ohlcDataArray
              state[sliceKey].volumeData = volumeArray
              state[sliceKey].oraclePriceData = oraclePriceArray
              state[sliceKey].baselinePriceData = baselinePriceArray
              state[sliceKey].refetchingCapped = ohlcDataArray.length < 298
              state[sliceKey].lastFetchEndTime = llamaOhlcResponse.data[0].time
              state[sliceKey].fetchStatus = 'READY'
            })
          )
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].fetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    fetchMoreOhlcData: async (
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      if (
        get()[sliceKey].refetchingHistory ||
        get()[sliceKey].lastRefetchLength === get()[sliceKey].chartOhlcData.length
      )
        return

      set(
        produce((state: State) => {
          state[sliceKey].refetchingHistory = true
          state[sliceKey].lastRefetchLength = get()[sliceKey].chartOhlcData.length
        })
      )

      const network = networks[chainId].id.toLowerCase()

      try {
        const llamaOhlcFetch = await fetch(
          `https://prices.curve.fi/v1/crvusd/llamma_ohlc/${network}/${poolAddress}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const llamaOhlcResponse: LlammaOhlcApiResponse = await llamaOhlcFetch.json()

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: LlamaOraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of llamaOhlcResponse.data) {
          volumeArray = [
            ...volumeArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.volume,
              color: item.open > item.close ? '#26a69982' : '#ef53507e',
            },
          ]

          baselinePriceArray = [
            ...baselinePriceArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              base_price: item.base_price,
            },
          ]

          oraclePriceArray = [
            ...oraclePriceArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              oracle_price: item.oracle_price,
            },
          ]

          ohlcDataArray = [
            ...ohlcDataArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              open: item.open,
              close: item.close,
              high: item.high,
              low: item.low,
            },
          ]
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartOhlcData = ohlcDataArray
            state[sliceKey].volumeData = volumeArray
            state[sliceKey].oraclePriceData = oraclePriceArray
            state[sliceKey].baselinePriceData = baselinePriceArray
            state[sliceKey].refetchingCapped = ohlcDataArray.length < 298
            state[sliceKey].lastFetchEndTime = llamaOhlcResponse.data[0].time
            state[sliceKey].refetchingHistory = false
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].fetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createOhlcChart
