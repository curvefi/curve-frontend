import type { PageTransferProps } from '@main/components/PagePool/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'
import React from 'react'

import { isValidAddress } from '@main/utils'

import ChipInactive from '@main/components/ChipInactive'
import AddGaugeLink from '@main/components/PagePool/components/AddGaugeLink'
import ContractComp from '@main/components/PagePool/components/ContractComp'
import { ChainId, PoolDataCacheOrApi } from '@main/types/main.types'

type ContractsProps = {
  rChainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
} & Pick<PageTransferProps, 'poolDataCacheOrApi'>

const Contracts: React.FC<ContractsProps> = ({ rChainId, poolDataCacheOrApi }) => {
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
