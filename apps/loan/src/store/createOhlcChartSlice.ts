import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  TimeOptions,
  FetchingStatus,
  LpPriceOhlcDataFormatted,
  LlammaOhlcApiResponse,
  VolumeData,
  LlamaBaselinePriceData,
  OraclePriceData,
  LpTradesData,
  LpLiquidityEventsData,
  LpTradesApiResponse,
  LpLiquidityEventsApiResponse,
} from 'ui/src/Chart/types'
import type { UTCTimestamp } from 'lightweight-charts'

import produce from 'immer'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  chartOhlcData: LpPriceOhlcDataFormatted[]
  volumeData: VolumeData[]
  oraclePriceData: OraclePriceData[]
  baselinePriceData: LlamaBaselinePriceData[]
  poolTradesData: LpTradesData[]
  poolLiquidityData: LpLiquidityEventsData[]
  chartFetchStatus: FetchingStatus
  activityFetchStatus: FetchingStatus
  timeOption: TimeOptions
  refetchingHistory: boolean
  refetchingCapped: boolean
  lastFetchEndTime: number
  lastRefetchLength: number
  activityHidden: boolean
  chartExpanded: boolean
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
    fetchPoolActivity(chainId: ChainId, poolAddress: string): void
    setActivityHidden(): void
    setChartExpanded(): void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  chartOhlcData: [],
  volumeData: [],
  oraclePriceData: [],
  baselinePriceData: [],
  poolTradesData: [],
  poolLiquidityData: [],
  chartFetchStatus: 'LOADING',
  activityFetchStatus: 'LOADING',
  timeOption: '1d',
  refetchingHistory: false,
  refetchingCapped: false,
  lastFetchEndTime: 0,
  lastRefetchLength: 0,
  activityHidden: false,
  chartExpanded: false,
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
          state[sliceKey].chartFetchStatus = 'LOADING'
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
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of llamaOhlcResponse.data) {
          volumeArray = [
            ...volumeArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.volume,
              color: item.open < item.close ? '#26a69982' : '#ef53507e',
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
              value: item.oracle_price,
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
              state[sliceKey].chartFetchStatus = 'READY'
            })
          )
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartFetchStatus = 'ERROR'
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
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of llamaOhlcResponse.data) {
          volumeArray = [
            ...volumeArray,
            {
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.volume,
              color: item.open < item.close ? '#26a69982' : '#ef53507e',
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
              value: item.oracle_price,
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
            state[sliceKey].chartFetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    fetchPoolActivity: async (chainId: ChainId, poolAddress: string) => {
      set(
        produce((state: State) => {
          state[sliceKey].activityFetchStatus = 'LOADING'
        })
      )

      const network = networks[chainId].id.toLowerCase()

      try {
        const tradesFetch = await fetch(
          `https://prices.curve.fi/v1/crvusd/llamma_trades/${network}/${poolAddress}?page=1&per_page=100
          `
        )
        const lpTradesRes: LpTradesApiResponse = await tradesFetch.json()
        const sortedData = lpTradesRes.data.sort((a: LpTradesData, b: LpTradesData) => {
          const timestampA = new Date(a.time).getTime()
          const timestampB = new Date(b.time).getTime()
          return timestampB - timestampA
        })

        if (sortedData) {
          set(
            produce((state: State) => {
              state[sliceKey].poolTradesData = sortedData
            })
          )
        }

        const liqudityEventsRes = await fetch(
          `https://prices.curve.fi/v1/crvusd/llamma_events/${network}/${poolAddress}?page=1&per_page=100`
        )
        const liquidityEventsData: LpLiquidityEventsApiResponse = await liqudityEventsRes.json()

        if (liquidityEventsData) {
          set(
            produce((state: State) => {
              state[sliceKey].poolLiquidityData = liquidityEventsData.data
              state[sliceKey].activityFetchStatus = 'READY'
            })
          )
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].activityFetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    setActivityHidden: () => {
      set(
        produce((state: State) => {
          state[sliceKey].activityHidden = !get()[sliceKey].activityHidden
        })
      )
    },
    setChartExpanded: () => {
      set(
        produce((state: State) => {
          state[sliceKey].chartExpanded = !get()[sliceKey].chartExpanded
        })
      )
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createOhlcChart
