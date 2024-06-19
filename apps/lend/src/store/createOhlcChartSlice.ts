import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import { getAddress } from 'ethers'
import type {
  TimeOptions,
  FetchingStatus,
  LpPriceOhlcDataFormatted,
  LlammaOhlcApiResponse,
  VolumeData,
  LlamaBaselinePriceData,
  OraclePriceData,
  LlammaTradesApiResponse,
  LlammaControllerApiResponse,
  LlammaTradeEvent,
  LlammaControllerEvent,
} from 'ui/src/Chart/types'
import type { UTCTimestamp } from 'lightweight-charts'

import produce from 'immer'

import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'

type SliceState = {
  chartLlammaOhlc: {
    data: LpPriceOhlcDataFormatted[]
    refetchingCapped: boolean
    lastFetchEndTime: number
    fetchStatus: FetchingStatus
  }
  chartOracleOhlc: {
    data: LpPriceOhlcDataFormatted[]
    refetchingCapped: boolean
    lastFetchEndTime: number
    fetchStatus: FetchingStatus
  }
  volumeData: VolumeData[]
  oraclePriceData: OraclePriceData[]
  baselinePriceData: LlamaBaselinePriceData[]
  lendTradesData: LlammaTradeEvent[]
  lendControllerData: LlammaControllerEvent[]
  activityFetchStatus: FetchingStatus
  timeOption: TimeOptions
  selectedChartIndex: number
  activityHidden: boolean
  chartExpanded: boolean
  oraclePriceVisible: boolean
  liqRangeCurrentVisible: boolean
  liqRangeNewVisible: boolean
}

const sliceKey = 'ohlcCharts'

export type OhlcChartSlice = {
  [sliceKey]: SliceState & {
    setChartTimeOption(timeOption: TimeOptions): void
    fetchLlammaOhlcData(
      chainId: ChainId,
      llammaId: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    fetchMoreLlammaOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    fetchOracleOhlcData(
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    fetchMoreOracleOhlcData(
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): void
    setChartSelectedIndex(index: number): void
    fetchPoolActivity(chainId: ChainId, poolAddress: string): void
    setActivityHidden(bool?: boolean): void
    setChartExpanded(bool?: boolean): void
    toggleOraclePriceVisible: () => void
    toggleLiqRangeCurrentVisible: () => void
    toggleLiqRangeNewVisible: () => void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  chartLlammaOhlc: {
    data: [],
    refetchingCapped: false,
    lastFetchEndTime: 0,
    fetchStatus: 'LOADING',
  },
  chartOracleOhlc: {
    data: [],
    refetchingCapped: false,
    lastFetchEndTime: 0,
    fetchStatus: 'LOADING',
  },
  volumeData: [],
  oraclePriceData: [],
  baselinePriceData: [],
  lendTradesData: [],
  lendControllerData: [],
  activityFetchStatus: 'LOADING',
  timeOption: '1d',
  selectedChartIndex: 1,
  activityHidden: false,
  chartExpanded: false,
  oraclePriceVisible: true,
  liqRangeCurrentVisible: true,
  liqRangeNewVisible: true,
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
    fetchLlammaOhlcData: async (
      chainId: ChainId,
      llammaId: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartLlammaOhlc.fetchStatus = 'LOADING'
          state[sliceKey].chartLlammaOhlc.refetchingCapped = DEFAULT_STATE.chartLlammaOhlc.refetchingCapped
        })
      )
      const network = networks[chainId].id.toLowerCase()

      try {
        const lendOhlcFetch = await fetch(
          `https://prices.curve.fi/v1/lending/llamma_ohlc/${network}/${poolAddress}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const lendOhlcResponse: LlammaOhlcApiResponse = await lendOhlcFetch.json()

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of lendOhlcResponse.data) {
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
        const arrLength = oraclePriceArray.length - 1
        const marketPrices = get().markets.pricesMapper[llammaId]
        const { prices: oraclePrice } = marketPrices ?? {}
        oraclePriceArray[arrLength] = {
          ...oraclePriceArray[arrLength],
          value: oraclePrice ? +oraclePrice : oraclePriceArray[arrLength].value,
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc.data = ohlcDataArray
            state[sliceKey].chartLlammaOhlc.refetchingCapped = ohlcDataArray.length < 298
            state[sliceKey].chartLlammaOhlc.lastFetchEndTime = lendOhlcResponse.data[0].time
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'READY'
            state[sliceKey].volumeData = volumeArray
            state[sliceKey].oraclePriceData = oraclePriceArray
            state[sliceKey].baselinePriceData = baselinePriceArray
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    fetchMoreLlammaOhlcData: async (
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      const network = networks[chainId].id.toLowerCase()

      try {
        const llammaOhlcFetch = await fetch(
          `https://prices.curve.fi/v1/lending/llamma_ohlc/${network}/${poolAddress}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const llammaOhlcResponse: LlammaOhlcApiResponse = await llammaOhlcFetch.json()

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of llammaOhlcResponse.data) {
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
            state[sliceKey].chartLlammaOhlc.data = [...ohlcDataArray, ...get()[sliceKey].chartLlammaOhlc.data]
            state[sliceKey].chartLlammaOhlc.refetchingCapped = ohlcDataArray.length < 299
            state[sliceKey].chartLlammaOhlc.lastFetchEndTime = llammaOhlcResponse.data[0].time
            state[sliceKey].volumeData = [...volumeArray, ...get()[sliceKey].volumeData]
            state[sliceKey].oraclePriceData = [...oraclePriceArray, ...get()[sliceKey].oraclePriceData]
            state[sliceKey].baselinePriceData = [...baselinePriceArray, ...get()[sliceKey].baselinePriceData]
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'ERROR'
          })
        )
        console.log(error)
      }
    },
    fetchOracleOhlcData: async (
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartOracleOhlc.fetchStatus = 'LOADING'
          state[sliceKey].chartOracleOhlc.refetchingCapped = DEFAULT_STATE.chartOracleOhlc.refetchingCapped
        })
      )

      const network = networks[chainId].id.toLowerCase()
      const checkSummedController = getAddress(controller)

      try {
        const oracleOhlcDataFetch = await fetch(
          `https://prices.curve.fi/v1/lending/oracle_ohlc/${network}/${checkSummedController}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const oracleOhlcResponse = await oracleOhlcDataFetch.json()
        const oracleOhlcFormatted = oracleOhlcResponse.data.map((data: any) => {
          return {
            ...data,
            time: convertToLocaleTimestamp(data.time) as UTCTimestamp,
          }
        })

        set(
          produce((state: State) => {
            state[sliceKey].chartOracleOhlc.data = oracleOhlcFormatted
            state[sliceKey].chartOracleOhlc.refetchingCapped = oracleOhlcFormatted.length < 299
            state[sliceKey].chartOracleOhlc.lastFetchEndTime = oracleOhlcResponse.data[0].time
            state[sliceKey].chartOracleOhlc.fetchStatus = 'READY'
          })
        )
      } catch (error) {
        console.log(error)
      }
    },
    fetchMoreOracleOhlcData: async (
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      const network = networks[chainId].id.toLowerCase()
      const checkSummedController = getAddress(controller)

      try {
        const oracleOhlcDataFetch = await fetch(
          `https://prices.curve.fi/v1/lending/oracle_ohlc/${network}/${checkSummedController}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const oracleOhlcResponse = await oracleOhlcDataFetch.json()
        const oracleOhlcFormatted = oracleOhlcResponse.data.map((data: any) => {
          return {
            ...data,
            time: convertToLocaleTimestamp(data.time) as UTCTimestamp,
          }
        })

        set(
          produce((state: State) => {
            state[sliceKey].chartOracleOhlc.data = [...oracleOhlcFormatted, ...get()[sliceKey].chartOracleOhlc.data]
            state[sliceKey].chartOracleOhlc.refetchingCapped = oracleOhlcFormatted.length < 299
            state[sliceKey].chartOracleOhlc.lastFetchEndTime = oracleOhlcResponse.data[0].time
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartOracleOhlc.fetchStatus = 'ERROR'
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
          `https://prices.curve.fi/v1/lending/llamma_trades/${network}/${poolAddress}?page=1&per_page=100
          `
        )
        const lpTradesRes: LlammaTradesApiResponse = await tradesFetch.json()
        const sortedData = lpTradesRes.data.sort((a: LlammaTradeEvent, b: LlammaTradeEvent) => {
          const timestampA = new Date(a.timestamp).getTime()
          const timestampB = new Date(b.timestamp).getTime()
          return timestampB - timestampA
        })

        if (sortedData) {
          set(
            produce((state: State) => {
              state[sliceKey].lendTradesData = sortedData
            })
          )
        }

        const controllerEventsRes = await fetch(
          `https://prices.curve.fi/v1/lending/llamma_events/${network}/${poolAddress}?page=1&per_page=100`
        )
        const controllerEventsData: LlammaControllerApiResponse = await controllerEventsRes.json()

        const formattedLiquidityEventsData = controllerEventsData.data.map((data) => {
          return {
            ...data,
            deposit:
              data.deposit === null
                ? null
                : {
                    ...data.deposit,
                    amount: data.deposit.amount,
                  },
            withdrawal:
              data.withdrawal === null
                ? null
                : {
                    ...data.withdrawal,
                    amount_borrowed: data.withdrawal.amount_borrowed,
                    amount_collateral: data.withdrawal.amount_collateral,
                  },
          }
        })

        if (controllerEventsData) {
          set(
            produce((state: State) => {
              state[sliceKey].lendControllerData = formattedLiquidityEventsData
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
    setChartSelectedIndex: (index: number) => {
      set(
        produce((state: State) => {
          state[sliceKey].selectedChartIndex = index
        })
      )
    },
    setActivityHidden: (bool?: boolean) => {
      set(
        produce((state: State) => {
          state[sliceKey].activityHidden = bool !== undefined ? bool : !get()[sliceKey].activityHidden
        })
      )
    },
    setChartExpanded: (bool?: boolean) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartExpanded = bool !== undefined ? bool : !get()[sliceKey].chartExpanded
          state[sliceKey].activityHidden = false
        })
      )
    },
    toggleOraclePriceVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].oraclePriceVisible = !get()[sliceKey].oraclePriceVisible
        })
      )
    },
    toggleLiqRangeCurrentVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].liqRangeCurrentVisible = !get()[sliceKey].liqRangeCurrentVisible
        })
      )
    },
    toggleLiqRangeNewVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].liqRangeNewVisible = !get()[sliceKey].liqRangeNewVisible
        })
      )
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createOhlcChart
