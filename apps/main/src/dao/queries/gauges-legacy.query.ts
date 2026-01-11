import { fetchJson } from '@curvefi/prices-api/fetch'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

const GAUGES_LEGACY_URL = 'https://api.curve.finance/v1/getAllGauges'

type CurveApiBaseGauge = {
  isPool: boolean
  name: string
  shortName: string
  factory: boolean
  lpTokenPrice: number | null
  blockchainId: string
  gauge: string
  rootGauge?: string
  gauge_data: {
    inflation_rate: string
    working_supply: string
  }
  gauge_controller: {
    gauge_relative_weight: string
    gauge_future_relative_weight: string
    get_gauge_weight: string
    inflation_rate: string
  }
  gaugeCrvApy: [number, number]
  gaugeFutureCrvApy: [number, number]
  side_chain: boolean
  is_killed: boolean
  hasNoCrv: boolean
}

type CurveApiPoolGauge = CurveApiBaseGauge & {
  isPool: true
  poolUrls: {
    swap: string[]
    deposit: string[]
    withdraw: string[]
  }
  poolAddress: string
  virtualPrice: string | number
  type: string
  swap: string
  swap_token: string
}

type CurveApiLendingGauge = CurveApiBaseGauge & {
  isPool: false
  lendingVaultUrls: {
    deposit: string
    withdraw: string
  }
  lendingVaultAddress: string
}

type CurveApiGaugeData = CurveApiPoolGauge | CurveApiLendingGauge

type CurveGaugeResponse = {
  success: boolean
  data: {
    [poolId: string]: CurveApiGaugeData
  }
  generatedTimeMs: number
}

type GaugeCurveApiDataMapper = {
  [gaugeAddress: string]: CurveApiGaugeData
}

/**
 * Legacy refers to the fact that we're using the old api.curve.finance endpoint.
 * At some point in the future this functionality should be migrated to Prices API.
 */
export const { useQuery: useGaugesLegacy } = queryFactory({
  queryKey: () => ['gauges-legacy'] as const,
  queryFn: async () => {
    const { data } = await fetchJson<CurveGaugeResponse>(GAUGES_LEGACY_URL)

    return Object.values(data).reduce<GaugeCurveApiDataMapper>((acc, gaugeData) => {
      if (gaugeData.gauge) {
        acc[gaugeData.gauge.toLowerCase()] = gaugeData
      }
      return acc
    }, {})
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
