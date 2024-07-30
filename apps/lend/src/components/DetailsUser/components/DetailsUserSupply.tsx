import type { Detail } from '@/components/DetailsMarket/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import {
  Content,
  ContentStat,
  ContentStats,
  ContentStatTitle,
  ContentStatValue,
} from '@/components/DetailsMarket/styles'
import AlertNoVaultSharesFound from '@/components/AlertNoVaultSharesFound'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserSupplyStakedUnstaked from '@/components/DetailsUser/components/DetailsUserSupplyStakedUnstaked'

const DetailsUserSupply = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, userActiveKey, owmDataCachedOrApi } = pageProps

  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { signerAddress } = api ?? {}
  const { vaultShares, gauge } = userBalancesResp ?? {}

  const showConnectWallet = typeof signerAddress !== 'undefined' && !signerAddress
  const foundVaultShares = typeof vaultShares !== 'undefined' && (+vaultShares > 0 || +gauge > 0)

  const cellProps = {
    rChainId,
    rOwmId,
    isBold: true,
    owmDataCachedOrApi,
    userActiveKey,
    size: 'md' as const,
  }

  const stats: Detail[][] = [
    [
      { title: t`Supply Token`, value: <CellToken {...cellProps} type="borrowed" module="supply" /> },
      { title: t`Lend APR`, value: <CellRate {...cellProps} type="supply" /> },
    ],
    [
      {
        title: t`Vault shares`,
        value: <DetailsUserSupplyStakedUnstaked userActiveKey={userActiveKey} />,
        className: 'isRow',
      },
    ],
  ]

  return (
    <div>
      {showConnectWallet ? (
        <DetailsConnectWallet />
      ) : foundVaultShares ? (
        <Content paddingTop>
          <Wrapper>
            <CellUserMain {...cellProps} type="supply" />

            {/* stats */}
            <div>
              {stats.map((detailSection) => {
                return (
                  <ContentStats key={detailSection[0].title}>
                    {detailSection.map(({ className = '', title, value, show }) => {
                      return (
                        _showContent(show) && (
                          <ContentStat className={className} key={`detail-${title}`}>
                            <ContentStatTitle>{title}</ContentStatTitle>
                            <ContentStatValue>{value}</ContentStatValue>
                          </ContentStat>
                        )
                      )
                    })}
                  </ContentStats>
                )
              })}
            </div>
          </Wrapper>
        </Content>
      ) : (
        <AlertNoVaultSharesFound hideLink={window?.location?.hash?.includes('vault')} {...pageProps} />
      )}
    </div>
  )
}

const Wrapper = styled.div`
  @media (min-width: ${breakpoints.md}rem) {
    align-items: flex-start;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`

export default DetailsUserSupply
