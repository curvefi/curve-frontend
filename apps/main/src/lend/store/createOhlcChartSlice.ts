import { getAddress } from 'ethers'
import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import networks from '@/lend/networks'
import type { State } from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import type { Address, Chain } from '@curvefi/prices-api'
import { getOracle } from '@curvefi/prices-api/lending'
import { getOHLC, getTrades, type LlammaTrade, getEvents, type LlammaEvent } from '@curvefi/prices-api/llamma'
import type {
  TimeOptions,
  FetchingStatus,
  LpPriceOhlcDataFormatted,
  LlamaBaselinePriceData,
  OraclePriceData,
} from '@ui-kit/features/candle-chart/types'

type OHLCTimeUnit = Parameters<typeof getOHLC>[0]['units']

type SliceState = {
  chartLlammaOhlc: {
    data: LpPriceOhlcDataFormatted[]
    oraclePriceData: OraclePriceData[]
    baselinePriceData: LlamaBaselinePriceData[]
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
    borrowedToken: {
      address: string
      symbol: string
    }
    collateralToken: {
      address: string
      symbol: string
    }
    // flag for disabling oracle pool data if no oracle pools are found for the market on the api
    dataDisabled: boolean
  }
  lendTradesData: LlammaTrade[]
  lendControllerData: LlammaEvent[]
  activityFetchStatus: FetchingStatus
  timeOption: TimeOptions
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
      end: number,
    ): Promise<void>
    fetchMoreLlammaOhlcData(
      chainId: ChainId,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ): Promise<{
      ohlcData: LpPriceOhlcDataFormatted[]
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
      end: number,
    ): Promise<void>
    fetchMoreOraclePoolOhlcData(
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ): Promise<{
      ohlcData: LpPriceOhlcDataFormatted[]
      oracleData: OraclePriceData[]
      baselineData: LlamaBaselinePriceData[]
      refetchingCapped: boolean
      lastFetchEndTime: number
      borrowedToken: {
        address: string
        symbol: string
      }
      collateralToken: {
        address: string
        symbol: string
      }
    }>
    fetchMoreData(
      chainId: ChainId,
      controller: string,
      poolAddress: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ): Promise<void>
    fetchPoolActivity(chainId: ChainId, poolAddress: string): Promise<void>
    toggleOraclePriceVisible: () => void
    toggleLiqRangeCurrentVisible: () => void
    toggleLiqRangeNewVisible: () => void
    resetState(chainId: ChainId): void
  }
}

const DEFAULT_STATE: SliceState = {
  chartLlammaOhlc: {
    data: [],
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
    borrowedToken: {
      address: '',
      symbol: '',
    },
    collateralToken: {
      address: '',
      symbol: '',
    },
    refetchingCapped: false,
    lastFetchEndTime: 0,
    fetchStatus: 'LOADING',
    dataDisabled: false,
  },
  lendTradesData: [],
  lendControllerData: [],
  activityFetchStatus: 'LOADING',
  timeOption: '1d',
  oraclePriceVisible: true,
  liqRangeCurrentVisible: true,
  liqRangeNewVisible: true,
}

const createOhlcChart = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    setChartTimeOption: (timeOption: TimeOptions) => {
      set(
        produce((state: State) => {
          state[sliceKey].timeOption = timeOption
        }),
      )
    },
    fetchLlammaOhlcData: async (
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
          state[sliceKey].chartLlammaOhlc = {
            fetchStatus: 'LOADING',
            data: DEFAULT_STATE.chartLlammaOhlc.data,
            oraclePriceData: DEFAULT_STATE.chartLlammaOhlc.oraclePriceData,
            baselinePriceData: DEFAULT_STATE.chartLlammaOhlc.baselinePriceData,
            refetchingCapped: DEFAULT_STATE.chartLlammaOhlc.refetchingCapped,
            lastFetchEndTime: DEFAULT_STATE.chartLlammaOhlc.lastFetchEndTime,
            dataDisabled: DEFAULT_STATE.chartLlammaOhlc.dataDisabled,
          }
        }),
      )
      const network = networks[chainId].id.toLowerCase()

      try {
        const ohlc = await getOHLC({
          endpoint: 'lending',
          chain: network as Chain,
          llamma: poolAddress as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        if (ohlc.length === 0) {
          throw new Error('No LLAMMA OHLC data found. Data may be unavailable for this pool.')
        }

        const baselinePriceArray: LlamaBaselinePriceData[] = []
        const oraclePriceArray: OraclePriceData[] = []
        const ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

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
            state[sliceKey].chartLlammaOhlc.lastFetchEndTime = ohlc[0].time.getUTCTimestamp()
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'READY'
            state[sliceKey].chartLlammaOhlc.oraclePriceData = oraclePriceArray
            state[sliceKey].chartLlammaOhlc.baselinePriceData = baselinePriceArray
            state[sliceKey].chartLlammaOhlc.dataDisabled = false
          }),
        )
      } catch (error) {
        console.warn(error)
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc = {
              fetchStatus: 'ERROR',
              data: DEFAULT_STATE.chartLlammaOhlc.data,
              oraclePriceData: DEFAULT_STATE.chartLlammaOhlc.oraclePriceData,
              baselinePriceData: DEFAULT_STATE.chartLlammaOhlc.baselinePriceData,
              refetchingCapped: DEFAULT_STATE.chartLlammaOhlc.refetchingCapped,
              lastFetchEndTime: DEFAULT_STATE.chartLlammaOhlc.lastFetchEndTime,
              dataDisabled: true,
            }
          }),
        )
      }
    },
    fetchMoreLlammaOhlcData: async (
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
          endpoint: 'lending',
          chain: network as Chain,
          llamma: poolAddress as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        const baselinePriceArray: LlamaBaselinePriceData[] = []
        const oraclePriceArray: OraclePriceData[] = []
        const ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

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

        return {
          ohlcData: ohlcDataArray,
          oracleData: oraclePriceArray,
          baselineData: baselinePriceArray,
          refetchingCapped: ohlcDataArray.length < 299,
          lastFetchEndTime: ohlc[0].time.getUTCTimestamp(),
        }
      } catch (error) {
        console.warn(error)
        set(
          produce((state: State) => {
            state[sliceKey].chartLlammaOhlc.fetchStatus = 'ERROR'
          }),
        )
        return {
          ohlcData: [],
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
      end: number,
    ) => {
      set(
        produce((state: State) => {
          state[sliceKey].chartOraclePoolOhlc = {
            fetchStatus: 'LOADING',
            data: DEFAULT_STATE.chartOraclePoolOhlc.data,
            oraclePriceData: DEFAULT_STATE.chartOraclePoolOhlc.oraclePriceData,
            baselinePriceData: DEFAULT_STATE.chartOraclePoolOhlc.baselinePriceData,
            borrowedToken: DEFAULT_STATE.chartOraclePoolOhlc.borrowedToken,
            collateralToken: DEFAULT_STATE.chartOraclePoolOhlc.collateralToken,
            refetchingCapped: DEFAULT_STATE.chartOraclePoolOhlc.refetchingCapped,
            lastFetchEndTime: DEFAULT_STATE.chartOraclePoolOhlc.lastFetchEndTime,
            dataDisabled: DEFAULT_STATE.chartOraclePoolOhlc.dataDisabled,
          }
        }),
      )

      const network = networks[chainId].id.toLowerCase()
      const checkSummedController = getAddress(controller)

      try {
        const { pools, ohlc } = await getOracle({
          endpoint: 'lending',
          chain: network as Chain,
          controller: checkSummedController as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        if (ohlc.length === 0) {
          throw new Error('No oracle OHLC data found. Data may be unavailable for this pool.')
        }

        const baselinePriceArray: LlamaBaselinePriceData[] = []
        const oraclePriceArray: OraclePriceData[] = []
        const ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

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

          ohlcDataArray.push({
            time,
            open: item.open,
            close: item.close,
            high: item.high,
            low: item.low,
          })
        }

        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc.data = ohlcDataArray
            state[sliceKey].chartOraclePoolOhlc.collateralToken = {
              address: pools[0].collateralAddress,
              symbol: pools[0].collateralSymbol,
            }
            state[sliceKey].chartOraclePoolOhlc.borrowedToken = {
              address: pools[pools.length - 1].borrowedAddress,
              symbol: pools[pools.length - 1].borrowedSymbol,
            }
            state[sliceKey].chartOraclePoolOhlc.oraclePriceData = oraclePriceArray
            state[sliceKey].chartOraclePoolOhlc.baselinePriceData = baselinePriceArray
            state[sliceKey].chartOraclePoolOhlc.refetchingCapped = ohlcDataArray.length < 299
            state[sliceKey].chartOraclePoolOhlc.lastFetchEndTime = ohlc[0].time.getUTCTimestamp()
            state[sliceKey].chartOraclePoolOhlc.fetchStatus = 'READY'
            state[sliceKey].chartOraclePoolOhlc.dataDisabled = false
          }),
        )
      } catch (error) {
        console.warn(error)
        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc = {
              fetchStatus: 'ERROR',
              data: DEFAULT_STATE.chartOraclePoolOhlc.data,
              borrowedToken: DEFAULT_STATE.chartOraclePoolOhlc.borrowedToken,
              collateralToken: DEFAULT_STATE.chartOraclePoolOhlc.collateralToken,
              oraclePriceData: DEFAULT_STATE.chartOraclePoolOhlc.oraclePriceData,
              baselinePriceData: DEFAULT_STATE.chartOraclePoolOhlc.baselinePriceData,
              refetchingCapped: DEFAULT_STATE.chartOraclePoolOhlc.refetchingCapped,
              lastFetchEndTime: DEFAULT_STATE.chartOraclePoolOhlc.lastFetchEndTime,
              dataDisabled: true,
            }
          }),
        )
      }
    },
    fetchMoreOraclePoolOhlcData: async (
      chainId: ChainId,
      controller: string,
      interval: number,
      timeUnit: string,
      start: number,
      end: number,
    ) => {
      const network = networks[chainId].id.toLowerCase()
      const checkSummedController = getAddress(controller)

      try {
        const { pools, ohlc } = await getOracle({
          endpoint: 'lending',
          chain: network as Chain,
          controller: checkSummedController as Address,
          interval,
          units: timeUnit as OHLCTimeUnit,
          start,
          end,
        })

        const baselinePriceArray: LlamaBaselinePriceData[] = []
        const oraclePriceArray: OraclePriceData[] = []
        const ohlcDataArray: LpPriceOhlcDataFormatted[] = []

        for (const item of ohlc) {
          const time = item.time.getLocalTimestamp()

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

          ohlcDataArray.push({
            time,
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
          lastFetchEndTime: ohlc[0].time.getUTCTimestamp(),
          collateralToken: {
            address: pools[0].collateralAddress,
            symbol: pools[0].collateralSymbol,
          },
          borrowedToken: {
            address: pools[pools.length - 1].borrowedAddress,
            symbol: pools[pools.length - 1].borrowedSymbol,
          },
        }
      } catch (error) {
        console.warn(error)
        set(
          produce((state: State) => {
            state[sliceKey].chartOraclePoolOhlc.fetchStatus = 'ERROR'
          }),
        )
        return {
          ohlcData: [],
          oracleData: [],
          baselineData: [],
          collateralToken: DEFAULT_STATE.chartOraclePoolOhlc.collateralToken,
          borrowedToken: DEFAULT_STATE.chartOraclePoolOhlc.borrowedToken,
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
      end: number,
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
              borrowedToken: oracleData.borrowedToken,
              collateralToken: oracleData.collateralToken,
              oraclePriceData: [...oracleData.oracleData, ...state[sliceKey].chartOraclePoolOhlc.oraclePriceData],
              baselinePriceData: [...oracleData.baselineData, ...state[sliceKey].chartOraclePoolOhlc.baselinePriceData],
              refetchingCapped: oracleData.refetchingCapped,
              lastFetchEndTime: oracleData.lastFetchEndTime,
              dataDisabled: false,
            }

            state[sliceKey].chartLlammaOhlc = {
              fetchStatus: 'READY',
              data: [...llammaData.ohlcData, ...state[sliceKey].chartLlammaOhlc.data],
              oraclePriceData: [...llammaData.oracleData, ...state[sliceKey].chartLlammaOhlc.oraclePriceData],
              baselinePriceData: [...llammaData.baselineData, ...state[sliceKey].chartLlammaOhlc.baselinePriceData],
              refetchingCapped: llammaData.refetchingCapped,
              lastFetchEndTime: llammaData.lastFetchEndTime,
              dataDisabled: false,
            }
          }),
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
              borrowedToken: oracleData.borrowedToken,
              collateralToken: oracleData.collateralToken,
              oraclePriceData: [...oracleData.oracleData, ...state[sliceKey].chartOraclePoolOhlc.oraclePriceData],
              baselinePriceData: [...oracleData.baselineData, ...state[sliceKey].chartOraclePoolOhlc.baselinePriceData],
              refetchingCapped: oracleData.refetchingCapped,
              lastFetchEndTime: oracleData.lastFetchEndTime,
              dataDisabled: false,
            }
          }),
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
              oraclePriceData: [...llammaData.oracleData, ...state[sliceKey].chartLlammaOhlc.oraclePriceData],
              baselinePriceData: [...llammaData.baselineData, ...state[sliceKey].chartLlammaOhlc.baselinePriceData],
              refetchingCapped: llammaData.refetchingCapped,
              lastFetchEndTime: llammaData.lastFetchEndTime,
              dataDisabled: false,
            }
          }),
        )

        return
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
          endpoint: 'lending',
          chain: network as Chain,
          llamma: poolAddress as Address,
          page: 1,
          perPage: 100,
        })

        const sortedData = trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        if (sortedData) {
          set(
            produce((state: State) => {
              state[sliceKey].lendTradesData = sortedData
            }),
          )
        }

        const { events } = await getEvents({
          endpoint: 'lending',
          chain: network as Chain,
          llamma: poolAddress as Address,
          page: 1,
          perPage: 100,
        })

        if (events) {
          set(
            produce((state: State) => {
              state[sliceKey].lendControllerData = events
              state[sliceKey].activityFetchStatus = 'READY'
            }),
          )
        }
      } catch (error) {
        console.warn(error)
        set(
          produce((state: State) => {
            state[sliceKey].activityFetchStatus = 'ERROR'
          }),
        )
      }
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
