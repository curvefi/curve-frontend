import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import type { QueryProp } from '@evm-ui/types/util'
import { amount, formatNumber } from '@evm-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'

export const Prices = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const poolDataCacheOrApi = poolQuery.data
  const poolId = poolDataCacheOrApi?.pool.id
  const poolAddress = getPoolAddress(poolDataCacheOrApi)
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const { data: parameters } = usePoolParameters({ chainId, poolId })
  const { data: snapshots } = usePoolSnapshots({ chain, poolAddress })
  const { priceOracle, priceScale } = parameters ?? {}
  const snapshotData = snapshots?.[0]
  // Prices API snapshot values are 1e18-scaled, while pool parameters are already human-scale.
  const priceOracleData = priceOracle?.length ? priceOracle : snapshotData?.priceOracle?.map(price => price / 10 ** 18)
  const priceScaleData = priceScale?.length ? priceScale : snapshotData?.priceScale?.map(price => price / 10 ** 18)

  // Curve price oracle/scale arrays omit the base token, so value index 0 belongs to token index 1.
  const priceRows = poolDataCacheOrApi?.tokens.slice(1).map((label, index) => ({
    label,
    index,
  }))

  return (
    <>
      {!!priceOracleData?.length && (
        <Card size="inline">
          <CardHeader title={t`Price Oracle`} />
          <CardContent component={Stack}>
            {priceRows?.map(({ label, index }) => (
              <ActionInfo
                key={`price-oracle-${index}`}
                label={label}
                value={formatNumber(amount(priceOracleData?.[index]), 'pool.parameter')}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {!!priceScaleData?.length && (
        <Card size="inline">
          <CardHeader title={t`Price Scale`} />
          <CardContent component={Stack}>
            {priceRows?.map(({ label, index }) => (
              <ActionInfo
                key={`price-scale-${index}`}
                label={label}
                value={formatNumber(amount(priceScaleData?.[index]), 'pool.parameter')}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {(snapshotData?.xcpProfit != null || snapshotData?.xcpProfitA != null) && (
        <Card size="inline">
          <CardHeader title={t`Xcp Profit`} />
          <CardContent component={Stack}>
            {snapshotData?.xcpProfit != null && (
              <ActionInfo
                label={t`Xcp Profit`}
                value={formatNumber(amount(snapshotData.xcpProfit / 10 ** 18), 'pool.parameter')}
              />
            )}
            {snapshotData?.xcpProfitA != null && (
              <ActionInfo
                label={t`Xcp Profit A`}
                value={formatNumber(amount(snapshotData.xcpProfitA / 10 ** 18), 'pool.parameter')}
              />
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
