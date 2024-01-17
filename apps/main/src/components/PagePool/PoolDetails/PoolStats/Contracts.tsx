import type { PageTransferProps } from '@/components/PagePool/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'
import React from 'react'

import { isValidAddress } from '@/utils'

import ChipInactive from '@/components/ChipInactive'
import AddGaugeLink from '@/components/PagePool/components/AddGaugeLink'
import ContractComp from '@/components/PagePool/components/ContractComp'

const Contracts = ({
  rChainId,
  poolDataCacheOrApi,
}: { rChainId: ChainId } & Pick<PageTransferProps, 'poolDataCacheOrApi'>) => {
  const { address = '', lpToken = '', gauge = '' } = poolDataCacheOrApi.pool
  const isSameAddress = address === lpToken
  const gaugeAddress = isValidAddress(gauge) ? gauge : ''

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
              {t`Gauge`} {poolDataCacheOrApi.pool.isGaugeKilled ? <ChipInactive>Inactive</ChipInactive> : null}
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
