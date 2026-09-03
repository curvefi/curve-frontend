import type { Address } from 'viem'
import { ChipInactive } from '@/dex/components/ChipInactive'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { t } from '@evm-ui/lib/i18n'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { isAddressEqual, ZERO_ADDRESS as zeroAddress } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
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

  const { data: metadata } = usePoolMetadata({ chain: network.blockchainId as BlockchainId, poolAddress })
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
              chainId={chainId}
              address={poolAddress}
              title={isSameAddress ? t`Pool / Token` : t`Pool`}
            />
          )}

          {!isSameAddress && lpTokenAddress && (
            <AddressActionInfo chainId={chainId} address={lpTokenAddress} title={t`Token`} />
          )}

          {!isAddressEqual(gaugeAddress, zeroAddress) && (
            <AddressActionInfo
              chainId={chainId}
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
            <AddressActionInfo key={oracle.address} chainId={chainId} {...oracle} />
          ))}
        </Section>
      </CardContent>
    </Card>
  )
}
