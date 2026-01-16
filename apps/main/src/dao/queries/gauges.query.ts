import { fetchJson } from '@curvefi/prices-api/fetch'
import { fromEntries } from '@curvefi/prices-api/objects.util'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { shortenAddress } from '@ui-kit/utils'

const GAUGES_URL = 'https://prices.curve.finance/v1/dao/gauges/overview'

type PricesGaugeOverviewData = {
  address: string
  effective_address?: string
  gauge_type: string
  name: string | null
  version: string | null
  lp_token: string
  pool: {
    address: string
    name: string
    chain: string
    tvl_usd: number
    trading_volume_24h: number
  } | null
  tokens: [{ symbol: string; address: string; precision: number }]
  market: {
    name: string
    chain: string
  } | null
  is_killed: boolean | null
  emissions: number
  prev_epoch_emissions: number
  gauge_weight: string
  gauge_weight_7d_delta: number | null
  gauge_weight_60d_delta: number | null
  gauge_relative_weight: number
  gauge_relative_weight_7d_delta: number | null
  gauge_relative_weight_60d_delta: number | null
  creation_tx: string
  creation_date: string
  last_vote_date: string
  last_vote_tx: string
}

type PricesGaugeOverviewResponse = {
  gauges: PricesGaugeOverviewData[]
}

export type GaugeFormattedData = Omit<PricesGaugeOverviewData, 'gauge_weight'> & {
  title: string
  platform: string
  gauge_weight: number
}

export type GaugeMapper = {
  [gaugeAddress: string]: GaugeFormattedData
}

const formatGaugeTitle = (poolName: string | undefined, marketName: string | null, address: string): string => {
  if (poolName) {
    return (poolName.split(': ')[1] || poolName)
      .replace(/curve\.fi/i, '')
      .replace(/\(FRAXBP\)/i, '')
      .trim()
  }
  return marketName ?? shortenAddress(address) ?? ''
}

/** TODO: This query body implementation can probably be replaced with a simple call of getGauges from prices-api\src\gauge\api.ts? */
export const {
  useQuery: useGauges,
  getQueryData: getGauges,
  refetchQuery: refetchGauges,
} = queryFactory({
  queryKey: () => ['gauges'] as const,
  queryFn: async () => {
    const { gauges } = await fetchJson<PricesGaugeOverviewResponse>(GAUGES_URL)

    return fromEntries(
      gauges.map((gauge) => [
        gauge.effective_address?.toLowerCase() ?? gauge.address.toLowerCase(),
        {
          // effective_address is the sidechain gauge address
          ...gauge,
          platform: gauge.market !== null ? 'Lend' : gauge.pool !== null ? 'AMM' : '',
          title: formatGaugeTitle(gauge.pool?.name, gauge.market?.name ?? null, gauge.address),
          gauge_weight: +gauge.gauge_weight,
          gauge_relative_weight: +(gauge.gauge_relative_weight * 100),
          gauge_relative_weight_7d_delta:
            gauge.gauge_relative_weight_7d_delta != null ? +(gauge.gauge_relative_weight_7d_delta * 100) : null,
          gauge_relative_weight_60d_delta:
            gauge.gauge_relative_weight_60d_delta != null ? +(gauge.gauge_relative_weight_60d_delta * 100) : null,
        },
      ]),
    )
  },
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
