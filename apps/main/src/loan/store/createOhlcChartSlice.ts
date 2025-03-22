import produce from 'immer'
import type {
  TimeOptions,
  FetchingStatus,
  LpPriceOhlcDataFormatted,
  VolumeData,
  LlamaBaselinePriceData,
  OraclePriceData,
} from 'ui/src/Chart/types'
import type { GetState, SetState } from 'zustand'
import networks from '@/loan/networks'
import type { State } from '@/loan/store/useStore'
import { ChainId } from '@/loan/types/loan.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { getOHLC, getTrades, type LlammaTrade, getEvents, type LlammaEvent } from '@curvefi/prices-api/llamma'

type OHLCTimeUnit = Parameters<typeof getOHLC>[0]['units']

type SliceState = {
  chartOhlcData: LpPriceOhlcDataFormatted[]
  volumeData: VolumeData[]
  oraclePriceData: OraclePriceData[]
  baselinePriceData: LlamaBaselinePriceData[]
  llammaTradesData: LlammaTrade[]
  llammaControllerData: LlammaEvent[]
  chartFetchStatus: FetchingStatus
  activityFetchStatus: FetchingStatus
  timeOption: TimeOptions
  refetchingCapped: boolean
  lastFetchEndTime: number
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
    fetchOhlcData(
      chainId: ChainId,
      llammaId: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ): void
    fetchMoreOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ): void
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
  chartOhlcData: [],
  volumeData: [],
  oraclePriceData: [],
  baselinePriceData: [],
  llammaTradesData: [],
  llammaControllerData: [],
  chartFetchStatus: 'LOADING',
  activityFetchStatus: 'LOADING',
  timeOption: '1d',
  refetchingCapped: false,
  lastFetchEndTime: 0,
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
        }),
      )
    },
    fetchOhlcData: async (
      chainId: ChainId,
      llammaId: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartFetchStatus = 'LOADING'
          state[sliceKey].refetchingCapped = DEFAULT_STATE.refetchingCapped
        }),
      )
      const network = networks[chainId].id.toLowerCase()

      try {
        const ohlc = await getOHLC({
          endpoint: 'crvusd',
          chain: network as Chain,
          llamma: poolAddress as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

          if (item.volume && item.open && item.close) {
            volumeArray.push({
              time,
              value: item.volume,
              color: item.open < item.close ? '#26a69982' : '#ef53507e',
            })
          }
          if (item.basePrice) {
            baselinePriceArray.push({
              time,
              base_price: item.basePrice,
            })
          }
          if (item.oraclePrice) {
            oraclePriceArray.push({
              time,
              value: item.oraclePrice,
            })
          }
          if (item.open && item.close && item.high && item.low) {
            ohlcDataArray.push({
              time,
              open: item.open,
              close: item.close,
              high: item.high,
              low: item.low,
            })
          }
        }
        const arrLength = oraclePriceArray.length - 1
        const loanPriceInfo = get().loans.detailsMapper[llammaId]?.priceInfo
        const { oraclePrice } = loanPriceInfo ?? {}
        oraclePriceArray[arrLength] = {
          ...oraclePriceArray[arrLength],
          value: oraclePrice ? +oraclePrice : oraclePriceArray[arrLength].value,
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartOhlcData = ohlcDataArray
            state[sliceKey].volumeData = volumeArray
            state[sliceKey].oraclePriceData = oraclePriceArray
            state[sliceKey].baselinePriceData = baselinePriceArray
            state[sliceKey].refetchingCapped = ohlcDataArray.length < 298
            state[sliceKey].lastFetchEndTime = ohlc[0].time.getUTCTimestamp()
            state[sliceKey].chartFetchStatus = 'READY'
          }),
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartFetchStatus = 'ERROR'
          }),
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
      end: number,
    ) => {
      const network = networks[chainId].id.toLowerCase()

      try {
        const ohlc = await getOHLC({
          endpoint: 'crvusd',
          chain: network as Chain,
          llamma: poolAddress as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        let volumeArray: VolumeData[] = []
        let baselinePriceArray: LlamaBaselinePriceData[] = []
        let oraclePriceArray: OraclePriceData[] = []
        let ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

          if (item.volume && item.open && item.close) {
            volumeArray.push({
              time,
              value: item.volume,
              color: item.open < item.close ? '#26a69982' : '#ef53507e',
            })
          }
          if (item.basePrice) {
            baselinePriceArray.push({
              time,
              base_price: item.basePrice,
            })
          }
          if (item.oraclePrice) {
            oraclePriceArray.push({
              time,
              value: item.oraclePrice,
            })
          }
          if (item.open && item.close && item.high && item.low) {
            ohlcDataArray.push({
              time,
              open: item.open,
              close: item.close,
              high: item.high,
              low: item.low,
            })
          }
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartOhlcData = [...ohlcDataArray, ...get()[sliceKey].chartOhlcData]
            state[sliceKey].volumeData = [...volumeArray, ...get()[sliceKey].volumeData]
            state[sliceKey].oraclePriceData = [...oraclePriceArray, ...get()[sliceKey].oraclePriceData]
            state[sliceKey].baselinePriceData = [...baselinePriceArray, ...get()[sliceKey].baselinePriceData]
            state[sliceKey].refetchingCapped = ohlcDataArray.length < 299
            state[sliceKey].lastFetchEndTime = ohlc[0].time.getUTCTimestamp()
          }),
        )
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].chartFetchStatus = 'ERROR'
          }),
        )
        console.log(error)
      }
    },
    fetchPoolActivity: async (chainId: ChainId, poolAddress: string) => {
      set(
        produce((state: State) => {
          state[sliceKey].activityFetchStatus = 'LOADING'
        }),
      )

      const network = networks[chainId].id.toLowerCase()

      try {
        const { trades } = await getTrades({
          endpoint: 'crvusd',
          chain: network as Chain,
          llamma: poolAddress as Address,
          page: 1,
          perPage: 100,
        })

        const sortedData = trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        if (sortedData) {
          set(
            produce((state: State) => {
              state[sliceKey].llammaTradesData = sortedData
            }),
          )
        }

        const { events } = await getEvents({
          endpoint: 'crvusd',
          chain: network as Chain,
          llamma: poolAddress as Address,
          page: 1,
          perPage: 100,
        })

        if (events) {
          set(
            produce((state: State) => {
              state[sliceKey].llammaControllerData = events
              state[sliceKey].activityFetchStatus = 'READY'
            }),
          )
        }
      } catch (error) {
        set(
          produce((state: State) => {
            state[sliceKey].activityFetchStatus = 'ERROR'
          }),
        )
        console.log(error)
      }
    },
    setActivityHidden: (bool?: boolean) => {
      set(
        produce((state: State) => {
          state[sliceKey].activityHidden = bool !== undefined ? bool : !get()[sliceKey].activityHidden
        }),
      )
    },
    setChartExpanded: (bool?: boolean) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartExpanded = bool !== undefined ? bool : !get()[sliceKey].chartExpanded
          state[sliceKey].activityHidden = false
        }),
      )
    },
    toggleOraclePriceVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].oraclePriceVisible = !get()[sliceKey].oraclePriceVisible
        }),
      )
    },
    toggleLiqRangeCurrentVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].liqRangeCurrentVisible = !get()[sliceKey].liqRangeCurrentVisible
        }),
      )
    },
    toggleLiqRangeNewVisible: () => {
      set(
        produce((state: State) => {
          state[sliceKey].liqRangeNewVisible = !get()[sliceKey].liqRangeNewVisible
        }),
      )
    },
    resetState: () => {
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})

export default createOhlcChart
