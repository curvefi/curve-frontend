import { getGauges as getPricesGauges, type Gauge } from '@curvefi/prices-api/gauge'
import { useLendingVault } from '@evm-ui/queries/lending-vaults.query'
import { dexPages, lendPages } from '@evm-ui/shared/routes'
import { shortenAddress } from '@evm-ui/utils'
import { findLpCoins } from '@evm-ui/utils/lp-token-coins'
import type { Token } from '@primitives/address.utils'
import { fromEntries, maybe } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'

export type GaugeToken = NonNullable<Gauge['tokens']>[number] & { lpCoins: Token[] | undefined }

export type GaugeFormattedData = Omit<Gauge, 'weight' | 'tokens'> & {
  title: string
  platform: string
  weight: number
  tokens: GaugeToken[] | undefined
}

export type GaugeMapper = Record<string, GaugeFormattedData>

/**
 * Prices omits getAllGauges deposit URLs; resolve lending lp_token vault addresses to controllers via lending markets.
 * Prices also labels some pool-backed gauges Fundraising; use their pool metadata to preserve deposit links.
 */
export const useGaugeDepositUrl = (gauge: GaugeFormattedData | undefined) => {
  const isLendingGauge = !!gauge?.market && !['Fundraising', 'LMCallback'].includes(gauge.type)
  const { data: market } = useLendingVault(
    { blockchainId: gauge?.market?.chain, vaultAddress: gauge?.lpToken },
    isLendingGauge,
  )
  return (
    maybe(gauge?.pool, ({ chain, address }) => dexPages.pool({ blockchainId: chain, poolAddress: address })) ??
    maybe(market, ({ chain, controller }) => lendPages.vault({ blockchainId: chain, marketId: controller }))
  )
}

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
  queryKey: () => ({ name: 'gauges', version: 3 }) as const,
  queryFn: async () => {
    const gauges = await getPricesGauges()

    return fromEntries(
      gauges.map(gauge => [
        gauge.effectiveAddress?.toLowerCase() ?? gauge.address.toLowerCase(),
        {
          // effectiveAddress is the sidechain gauge address
          ...gauge,
          // TODO: read the LP coins from the gauges overview once the prices API returns them
          tokens: gauge.tokens?.map(token => ({
            ...token,
            lpCoins: maybe(gauge.market, ({ chain }) => findLpCoins(chain, token.address)),
          })),
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
