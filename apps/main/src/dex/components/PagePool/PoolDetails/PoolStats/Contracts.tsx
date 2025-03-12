import styled from 'styled-components'
import ChipInactive from '@/dex/components/ChipInactive'
import AddGaugeLink from '@/dex/components/PagePool/components/AddGaugeLink'
import ContractComp from '@/dex/components/PagePool/components/ContractComp'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import { isValidAddress } from '@/dex/utils'
import { t } from '@ui-kit/lib/i18n'

type ContractsProps = {
  rChainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
} & Pick<PageTransferProps, 'poolDataCacheOrApi'>

const Contracts = ({ rChainId, poolDataCacheOrApi }: ContractsProps) => {
  const { address = '', lpToken = '', gauge } = poolDataCacheOrApi.pool
  const isSameAddress = address === lpToken
  const gaugeAddress = isValidAddress(gauge.address) ? gauge.address : ''

  return (
    <Article>
      <h3>{t`Contracts`}</h3>

      {address && (
        <ContractComp
          address={address}
          rChainId={rChainId}
          label={isSameAddress ? t`Pool / Token` : t`Pool`}
          showBottomBorder={!isSameAddress || !!gaugeAddress}
        />
      )}
      {!isSameAddress && lpToken && (
        <ContractComp address={lpToken} rChainId={rChainId} label={t`Token`} showBottomBorder={!!gaugeAddress} />
      )}
      {gaugeAddress && (
        <ContractComp
          address={gaugeAddress}
          rChainId={rChainId}
          label={
            <span>
              {t`Gauge`} {poolDataCacheOrApi.gauge.isKilled ? <ChipInactive>Inactive</ChipInactive> : null}
            </span>
          }
          showBottomBorder={false}
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

export default Contracts
