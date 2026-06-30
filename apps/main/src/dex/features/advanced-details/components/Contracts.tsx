import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { ChipInactive } from '@/dex/components/ChipInactive'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { Section } from './Section'

export const Contracts = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { data: network } = useNetworkByChain({ chainId })

  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const lpTokenAddress = poolDataCacheOrApi.pool.lpToken as Address
  const gaugeAddress = poolDataCacheOrApi.pool.gauge.address as Address
  const gaugeIsKilled = !!poolDataCacheOrApi.gauge.isKilled
  const isSameAddress = isAddressEqual(poolAddress, lpTokenAddress)

  const chain = network.networkId as BlockchainId
  const { data: metadata } = usePoolMetadata({ chain, poolAddress })
  const oracles = notFalsy(
    ...(metadata?.assetTypes?.map((assetType, index) => {
      const oracleAddress = metadata.oracles?.[index]?.oracleAddress
      const symbol = metadata.coins[index]?.symbol

      return (
        assetType === 1 &&
        oracleAddress &&
        !isAddressEqual(oracleAddress, zeroAddress) && {
          address: oracleAddress,
          title: symbol ? `${symbol} ${t`Oracle`}` : t`Oracle ${index + 1}`,
        }
      )
    }) ?? []),
  )

  return (
    <Card size="inline">
      <CardHeader title={t`Contracts`} />
      <CardContent component={Stack}>
        <Section>
          {poolAddress && (
            <AddressActionInfo
              network={network}
              address={poolAddress}
              title={isSameAddress ? t`Pool / Token` : t`Pool`}
            />
          )}

          {!isSameAddress && lpTokenAddress && (
            <AddressActionInfo network={network} address={lpTokenAddress} title={t`Token`} />
          )}

          {!isAddressEqual(gaugeAddress, zeroAddress) && (
            <AddressActionInfo
              network={network}
              address={gaugeAddress}
              title={
                <>
                  {t`Gauge`} {gaugeIsKilled && <ChipInactive>Inactive</ChipInactive>}
                </>
              }
            />
          )}
        </Section>

        <Section>
          {oracles.map(oracle => (
            <AddressActionInfo key={oracle.address} network={network} {...oracle} />
          ))}
        </Section>
      </CardContent>
    </Card>
  )
}
