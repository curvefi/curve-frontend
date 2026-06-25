import { type Address } from 'viem'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { amount, formatNumber } from '@ui-kit/utils'

export const Prices = ({
  chainId,
  poolId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolId: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const { data: network } = useNetworkByChain({ chainId })
  const chain = network.networkId as BlockchainId
  const { data: parameters } = usePoolParameters({ chainId, poolId })
  const { data: snapshots } = usePoolSnapshots({ chain, poolAddress })
  const { priceOracle, priceScale } = parameters ?? {}
  const snapshotData = snapshots?.[0]

  const getPriceLabel = (index: number) => poolDataCacheOrApi.tokens[index + 1] ?? t`Token ${index + 2}`

  return (
    <>
      {!!priceOracle?.length && (
        <Card size="inline">
          <CardHeader title={t`Price Oracle`} />
          <CardContent component={Stack}>
            {priceOracle.map((price, index) => {
              const label = getPriceLabel(index)

              return (
                <ActionInfo
                  key={`${label}-${price}`}
                  label={label}
                  value={formatNumber(amount(price), 'pool.parameter')}
                />
              )
            })}
          </CardContent>
        </Card>
      )}

      {!!priceScale?.length && (
        <Card size="inline">
          <CardHeader title={t`Price Scale`} />
          <CardContent component={Stack}>
            {priceScale.map((price, index) => {
              const label = getPriceLabel(index)

              return (
                <ActionInfo
                  key={`${label}-${price}`}
                  label={label}
                  value={formatNumber(amount(price), 'pool.parameter')}
                />
              )
            })}
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
