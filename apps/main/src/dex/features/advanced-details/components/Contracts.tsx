import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { ChipInactive } from '@/dex/components/ChipInactive'
import { useNetworkByChain } from '@/dex/entities/networks'
import { usePoolMetadata } from '@/dex/entities/pool-metadata.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import type { Chain as BlockchainId } from '@curvefi/prices-api'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { Section } from './Section'

export const Contracts = ({
  chainId,
  poolQuery,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const poolDataCacheOrApi = poolQuery.data
  const { data: network } = useNetworkByChain({ chainId })

  const poolAddress = getPoolAddress(poolDataCacheOrApi)
  const lpTokenAddress = poolDataCacheOrApi?.pool.lpToken as Address | undefined
  const gaugeAddress = poolDataCacheOrApi?.pool.gauge.address as Address | undefined
  const gaugeIsKilled = !!poolDataCacheOrApi?.gauge.isKilled
  const isSameAddress = poolAddress && lpTokenAddress ? isAddressEqual(poolAddress, lpTokenAddress) : false
  const loadingValue = mapQuery(poolQuery, () => undefined)

  const chain = network.networkId as BlockchainId
  const { data: metadata } = usePoolMetadata({ chain, poolAddress })
  const oracleRows = metadata?.assetTypes?.map((assetType, index) => {
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
  })
  const oracles = oracleRows && notFalsy(...oracleRows)

  return (
    <Card size="inline">
      <CardHeader title={t`Contracts`} />
      <CardContent component={Stack}>
        <Section>
          {poolQuery.isLoading ? (
            <ActionInfo label={isSameAddress ? t`Pool / Token` : t`Pool`} value={loadingValue} />
          ) : poolAddress ? (
            <AddressActionInfo
              network={network}
              address={poolAddress}
              title={isSameAddress ? t`Pool / Token` : t`Pool`}
            />
          ) : null}

          {poolQuery.isLoading && !isSameAddress ? (
            <ActionInfo label={t`Token`} value={loadingValue} />
          ) : !isSameAddress && lpTokenAddress ? (
            <AddressActionInfo network={network} address={lpTokenAddress} title={t`Token`} />
          ) : null}

          {!poolQuery.isLoading &&
          gaugeAddress &&
          isAddressEqual(gaugeAddress, zeroAddress) ? null : poolQuery.isLoading ? (
            <ActionInfo label={t`Gauge`} value={loadingValue} />
          ) : gaugeAddress ? (
            <AddressActionInfo
              network={network}
              address={gaugeAddress}
              title={
                <>
                  {t`Gauge`} {gaugeIsKilled && <ChipInactive>Inactive</ChipInactive>}
                </>
              }
            />
          ) : null}
        </Section>

        <Section>
          {oracles?.map(oracle => (
            <AddressActionInfo key={oracle.address} network={network} {...oracle} />
          ))}
        </Section>
      </CardContent>
    </Card>
  )
}
