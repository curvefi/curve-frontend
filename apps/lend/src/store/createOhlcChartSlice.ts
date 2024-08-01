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
    oraclePriceData: OraclePriceData[]
    baselinePriceData: LlamaBaselinePriceData[]
    volumeData: VolumeData[]
    refetchingCapped: boolean
    lastFetchEndTime: number
    fetchStatus: FetchingStatus
    dataDisabled: boolean
  }
  chartOraclePoolOhlc: {
    data: LpPriceOhlcDataFormatted[]
    oraclePriceData: OraclePriceData[]
    baselinePriceData: LlamaBaselinePriceData[]
    refetchingCapped: boolean
    lastFetchEndTime: number
    fetchStatus: FetchingStatus
    // flag for disabling oracle pool data if no oracle pools are found for the market on the api
    dataDisabled: boolean
  }
  lendTradesData: LlammaTradeEvent[]
  lendControllerData: LlammaControllerEvent[]
  activityFetchStatus: FetchingStatus
  timeOption: TimeOptions
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
    ): Promise<void>
    fetchMoreLlammaOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): Promise<{
      ohlcData: LpPriceOhlcDataFormatted[]
      volumeData: VolumeData[]
      oracleData: OraclePriceData[]
      baselineData: LlamaBaselinePriceData[]
      refetchingCapped: boolean
      lastFetchEndTime: number
    }>
    fetchOraclePoolOhlcData(
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): Promise<void>
    fetchMoreOraclePoolOhlcData(
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): Promise<{
      ohlcData: LpPriceOhlcDataFormatted[]
      oracleData: OraclePriceData[]
      baselineData: LlamaBaselinePriceData[]
      refetchingCapped: boolean
      lastFetchEndTime: number
    }>
    fetchMoreData(
      chainId: ChainId,
      controller: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ): Promise<void>
    fetchPoolActivity(chainId: ChainId, poolAddress: string): Promise<void>
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
    volumeData: [],
    oraclePriceData: [],
    baselinePriceData: [],
    refetchingCapped: false,
    lastFetchEndTime: 0,
    fetchStatus: 'LOADING',
    dataDisabled: false,
  },
  chartOraclePoolOhlc: {
    data: [],
    oraclePriceData: [],
    baselinePriceData: [],
    refetchingCapped: false,
    lastFetchEndTime: 0,
    fetchStatus: 'LOADING',
    dataDisabled: false,
  },
  lendTradesData: [],
  lendControllerData: [],
  activityFetchStatus: 'LOADING',
  timeOption: '1d',
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
          state[sliceKey].chartLlammaOhlc = {
            fetchStatus: 'LOADING',
            data: DEFAULT_STATE.chartLlammaOhlc.data,
            volumeData: DEFAULT_STATE.chartLlammaOhlc.volumeData,
            oraclePriceData: DEFAULT_STATE.chartLlammaOhlc.oraclePriceData,
            baselinePriceData: DEFAULT_STATE.chartLlammaOhlc.baselinePriceData,
            refetchingCapped: DEFAULT_STATE.chartLlammaOhlc.refetchingCapped,
            lastFetchEndTime: DEFAULT_STATE.chartLlammaOhlc.lastFetchEndTime,
            dataDisabled: DEFAULT_STATE.chartLlammaOhlc.dataDisabled,
          }
        })
      )
      const network = networks[chainId].id.toLowerCase()

      try {
        const lendOhlcFetch = await fetch(
          `https://prices.curve.fi/v1/lending/llamma_ohlc/${network}/${poolAddress}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const lendOhlcResponse = await lendOhlcFetch.json()

        // detail appears when no curve oracle pools can be found in the api
        if (lendOhlcResponse.detail) {
          throw new Error(lendOhlcResponse.detail)
        }

        if (lendOhlcResponse.data.length === 0) {
          throw new Error('No LLAMMA OHLC data found. Data may be unavailable for this pool.')
        }

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of lendOhlcResponse.data) {
          volumeArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            value: item.volume,
            color: item.open < item.close ? '#26a69982' : '#ef53507e',
          })

          baselinePriceArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            base_price: item.base_price,
          })

          oraclePriceArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            value: item.oracle_price,
          })

          ohlcDataArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            open: item.open,
            close: item.close,
            high: item.high,
            low: item.low,
          })
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
            state[sliceKey].chartLlammaOhlc.volumeData = volumeArray
            state[sliceKey].chartLlammaOhlc.oraclePriceData = oraclePriceArray
            state[sliceKey].chartLlammaOhlc.baselinePriceData = baselinePriceArray
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc = {
              fetchStatus: 'ERROR',
              data: DEFAULT_STATE.chartLlammaOhlc.data,
              volumeData: DEFAULT_STATE.chartLlammaOhlc.volumeData,
              oraclePriceData: DEFAULT_STATE.chartLlammaOhlc.oraclePriceData,
              baselinePriceData: DEFAULT_STATE.chartLlammaOhlc.baselinePriceData,
              refetchingCapped: DEFAULT_STATE.chartLlammaOhlc.refetchingCapped,
              lastFetchEndTime: DEFAULT_STATE.chartLlammaOhlc.lastFetchEndTime,
              dataDisabled: true,
            }
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
          volumeArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            value: item.volume,
            color: item.open < item.close ? '#26a69982' : '#ef53507e',
          })

          baselinePriceArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            base_price: item.base_price,
          })

          oraclePriceArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            value: item.oracle_price,
          })

          ohlcDataArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            open: item.open,
            close: item.close,
            high: item.high,
            low: item.low,
          })
        }

        return {
          ohlcData: ohlcDataArray,
          volumeData: volumeArray,
          oracleData: oraclePriceArray,
          baselineData: baselinePriceArray,
          refetchingCapped: ohlcDataArray.length < 299,
          lastFetchEndTime: llammaOhlcResponse.data[0].time,
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'ERROR'
          })
        )
        console.log(error)
        return {
          ohlcData: [],
          volumeData: [],
          oracleData: [],
          baselineData: [],
          refetchingCapped: false,
          lastFetchEndTime: 0,
        }
      }
    },
    fetchOraclePoolOhlcData: async (
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartOraclePoolOhlc = {
            fetchStatus: 'LOADING',
            data: DEFAULT_STATE.chartOraclePoolOhlc.data,
            oraclePriceData: DEFAULT_STATE.chartOraclePoolOhlc.oraclePriceData,
            baselinePriceData: DEFAULT_STATE.chartOraclePoolOhlc.baselinePriceData,
            refetchingCapped: DEFAULT_STATE.chartOraclePoolOhlc.refetchingCapped,
            lastFetchEndTime: DEFAULT_STATE.chartOraclePoolOhlc.lastFetchEndTime,
            dataDisabled: DEFAULT_STATE.chartOraclePoolOhlc.dataDisabled,
          }
        })
      )

      const network = networks[chainId].id.toLowerCase()
      const checkSummedController = getAddress(controller)

      try {
        const oracleOhlcDataFetch = await fetch(
          `https://prices.curve.fi/v1/lending/oracle_ohlc/${network}/${checkSummedController}?agg_number=${interval}&agg_units=${timeUnit}&start=${start}&end=${end}`
        )
        const oracleOhlcResponse = await oracleOhlcDataFetch.json()

        // detail appears when no curve oracle pools can be found in the api
        if (oracleOhlcResponse.detail) {
          throw new Error(oracleOhlcResponse.detail)
        }

        if (oracleOhlcResponse.data?.length === 0) {
          throw new Error('No oracle OHLC data found. Data may be unavailable for this pool.')
        }

        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of oracleOhlcResponse.data) {
          if (item.base_price) {
            baselinePriceArray.push({
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              base_price: item.base_price,
            })
          }

          if (item.oracle_price) {
            oraclePriceArray.push({
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.oracle_price,
            })
          }

          ohlcDataArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            open: item.open,
            close: item.close,
            high: item.high,
            low: item.low,
          })
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc.data = ohlcDataArray
            state[sliceKey].chartOraclePoolOhlc.oraclePriceData = oraclePriceArray
            state[sliceKey].chartOraclePoolOhlc.baselinePriceData = baselinePriceArray
            state[sliceKey].chartOraclePoolOhlc.refetchingCapped = ohlcDataArray.length < 299
            state[sliceKey].chartOraclePoolOhlc.lastFetchEndTime = oracleOhlcResponse.data[0].time
            state[sliceKey].chartOraclePoolOhlc.fetchStatus = 'READY'
          })
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc = {
              fetchStatus: 'ERROR',
              data: DEFAULT_STATE.chartOraclePoolOhlc.data,
              oraclePriceData: DEFAULT_STATE.chartOraclePoolOhlc.oraclePriceData,
              baselinePriceData: DEFAULT_STATE.chartOraclePoolOhlc.baselinePriceData,
              refetchingCapped: DEFAULT_STATE.chartOraclePoolOhlc.refetchingCapped,
              lastFetchEndTime: DEFAULT_STATE.chartOraclePoolOhlc.lastFetchEndTime,
              dataDisabled: true,
            }
          })
        )
        console.log(error)
      }
    },
    fetchMoreOraclePoolOhlcData: async (
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

        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of oracleOhlcResponse.data) {
          if (item.base_price) {
            baselinePriceArray.push({
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              base_price: item.base_price,
            })
          }

          if (item.oracle_price) {
            oraclePriceArray.push({
              time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
              value: item.oracle_price,
            })
          }

          ohlcDataArray.push({
            time: convertToLocaleTimestamp(item.time) as UTCTimestamp,
            open: item.open,
            close: item.close,
            high: item.high,
            low: item.low,
          })
        }

        return {
          ohlcData: ohlcDataArray,
          oracleData: oraclePriceArray,
          baselineData: baselinePriceArray,
          refetchingCapped: ohlcDataArray.length < 299,
          lastFetchEndTime: oracleOhlcResponse.data[0].time,
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc.fetchStatus = 'ERROR'
          })
        )
        console.log(error)
        return {
          data: [],
          refetchingCapped: false,
          lastFetchEndTime: 0,
        }
      }
    },
    fetchMoreData: async (
      chainId: ChainId,
      controller: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number
    ) => {
      const { chartLlammaOhlc, chartOraclePoolOhlc, fetchMoreLlammaOhlcData, fetchMoreOraclePoolOhlcData } =
        get()[sliceKey]

      if (chartLlammaOhlc.refetchingCapped && chartOraclePoolOhlc.refetchingCapped) {
        return
      }

      if (!chartOraclePoolOhlc.refetchingCapped && !chartLlammaOhlc.refetchingCapped) {
        const llammaDataPromise = fetchMoreLlammaOhlcData(chainId, poolAddress, interval, timeUnit, start, end)
        const oracleDataPromise = fetchMoreOraclePoolOhlcData(chainId, controller, interval, timeUnit, start, end)

        const [llammaData, oracleData] = await Promise.all([llammaDataPromise, oracleDataPromise])

        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc = {
              fetchStatus: 'READY',
              data: [...oracleData.ohlcData, ...state[sliceKey].chartOraclePoolOhlc.data],
              oraclePriceData: [...oracleData.oracleData, ...state[sliceKey].chartOraclePoolOhlc.oraclePriceData],
              baselinePriceData: [...oracleData.baselineData, ...state[sliceKey].chartOraclePoolOhlc.baselinePriceData],
              refetchingCapped: oracleData.refetchingCapped,
              lastFetchEndTime: oracleData.lastFetchEndTime,
              dataDisabled: false,
            }

            state[sliceKey].chartLlammaOhlc = {
              fetchStatus: 'READY',
              data: [...llammaData.ohlcData, ...state[sliceKey].chartLlammaOhlc.data],
              volumeData: [...llammaData.volumeData, ...state[sliceKey].chartLlammaOhlc.volumeData],
              oraclePriceData: [...llammaData.oracleData, ...state[sliceKey].chartLlammaOhlc.oraclePriceData],
              baselinePriceData: [...llammaData.baselineData, ...state[sliceKey].chartLlammaOhlc.baselinePriceData],
              refetchingCapped: llammaData.refetchingCapped,
              lastFetchEndTime: llammaData.lastFetchEndTime,
              dataDisabled: false,
            }
          })
        )

        return
      }

      if (!chartOraclePoolOhlc.refetchingCapped) {
        const oracleData = await fetchMoreOraclePoolOhlcData(chainId, controller, interval, timeUnit, start, end)

        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc = {
              fetchStatus: 'READY',
              data: [...oracleData.ohlcData, ...state[sliceKey].chartOraclePoolOhlc.data],
              oraclePriceData: [...oracleData.oracleData, ...state[sliceKey].chartOraclePoolOhlc.oraclePriceData],
              baselinePriceData: [...oracleData.baselineData, ...state[sliceKey].chartOraclePoolOhlc.baselinePriceData],
              refetchingCapped: oracleData.refetchingCapped,
              lastFetchEndTime: oracleData.lastFetchEndTime,
              dataDisabled: false,
            }
          })
        )

        return
      }

      if (!chartLlammaOhlc.refetchingCapped) {
        const llammaData = await fetchMoreLlammaOhlcData(chainId, poolAddress, interval, timeUnit, start, end)

        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc = {
              fetchStatus: 'READY',
              data: [...llammaData.ohlcData, ...state[sliceKey].chartLlammaOhlc.data],
              volumeData: [...llammaData.volumeData, ...state[sliceKey].chartLlammaOhlc.volumeData],
              oraclePriceData: [...llammaData.oracleData, ...state[sliceKey].chartLlammaOhlc.oraclePriceData],
              baselinePriceData: [...llammaData.baselineData, ...state[sliceKey].chartLlammaOhlc.baselinePriceData],
              refetchingCapped: llammaData.refetchingCapped,
              lastFetchEndTime: llammaData.lastFetchEndTime,
              dataDisabled: false,
            }
          })
        )

        return
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
