import { styled } from 'styled-components'
import { ChipInactive } from '@/dex/components/ChipInactive'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { isValidAddress } from '@/dex/utils'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'

type ContractsProps = {
  rChainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
} & Pick<PageTransferProps, 'poolDataCacheOrApi'>

export const Contracts = ({ rChainId, poolDataCacheOrApi }: ContractsProps) => {
  const { address = '', lpToken = '', gauge } = poolDataCacheOrApi.pool
  const isSameAddress = address === lpToken
  const gaugeAddress = isValidAddress(gauge.address) ? gauge.address : ''

  const { data: network } = useNetworkByChain({ chainId: rChainId })

  return (
    <Article>
      <h3>{t`Contracts`}</h3>

      {address && (
        <AddressActionInfo
          network={network}
          address={address}
          title={isSameAddress ? t`Pool / Token` : t`Pool`}
          isBorderBottom={!isSameAddress || !!gaugeAddress}
        />
      )}
      {!isSameAddress && lpToken && (
        <AddressActionInfo network={network} address={lpToken} title={t`Token`} isBorderBottom={!!gaugeAddress} />
      )}
      {gaugeAddress && (
        <AddressActionInfo
          network={network}
          address={gaugeAddress}
          title={
            <span>
              {t`Gauge`} {poolDataCacheOrApi.gauge.isKilled ? <ChipInactive>Inactive</ChipInactive> : null}
            </span>
          }
          isBorderBottom={false}
        />
      )}
      {!gaugeAddress && (
        <AddGaugeLink poolDataCacheOrApi={poolDataCacheOrApi} chainId={rChainId} address={address} lpToken={lpToken} />
      )}
    </Article>
  )
}

const Article = styled.article`
  .stats:last-of-type {
    border-bottom: none;
  }
`
