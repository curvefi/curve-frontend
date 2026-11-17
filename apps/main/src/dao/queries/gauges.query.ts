import { getGauges as getPricesGauges, type Gauge } from '@curvefi/prices-api/gauge'
import { dexPages, lendPages } from '@evm-ui/shared/routes'
import { shortenAddress } from '@evm-ui/utils'
import { fromEntries, maybe } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

export type GaugeFormattedData = Omit<Gauge, 'weight'> & { title: string; platform: string; weight: number }

export type GaugeMapper = Record<string, GaugeFormattedData>

export const getGaugeDepositUrl = (gauge: GaugeFormattedData | undefined) =>
  (gauge &&
    !['Fundraising', 'LMCallback'].includes(gauge.type) &&
    (gauge.pool?.chain
      ? dexPages.pool({ blockchainId: gauge.pool.chain, poolAddress: gauge.pool.address })
      : gauge.market?.chain &&
        gauge.lpToken &&
        lendPages.vault({ blockchainId: gauge.market.chain, marketId: gauge.lpToken }))) ||
  undefined

const formatGaugeTitle = (poolName: string | undefined, marketName: string | undefined, address: string): string => {
  if (poolName) {
    return (poolName.split(': ')[1] || poolName)
      .replace(/curve\.fi/i, '')
      .replace(/\(FRAXBP\)/i, '')
      .trim()
  }
  return marketName ?? shortenAddress(address) ?? ''
}

export const {
  useQuery: useGauges,
  getQueryData: getGauges,
  refetchQuery: refetchGauges,
} = queryFactory({
  queryKey: () => ({ name: 'gauges', version: 2 }) as const,
  queryFn: async () => {
    const gauges = await getPricesGauges()

    return fromEntries(
      gauges.map(gauge => [
        gauge.effectiveAddress?.toLowerCase() ?? gauge.address.toLowerCase(),
        {
          // effectiveAddress is the sidechain gauge address
          ...gauge,
          platform: gauge.market ? 'Lend' : gauge.pool ? 'AMM' : '',
          title: formatGaugeTitle(gauge.pool?.name, gauge.market?.name, gauge.address),
          weight: Number(gauge.weight),
          weightRelative: gauge.weightRelative * 100,
          weightRelativeDelta7d: maybe(gauge.weightRelativeDelta7d, data => data * 100),
          weightRelativeDelta60d: maybe(gauge.weightRelativeDelta60d, data => data * 100),
        },
      ]),
    )
  },
  category: 'dao.gauges',
  validationSuite: EmptyValidationSuite,
})
