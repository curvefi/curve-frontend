import type { Detail } from '@/components/DetailsMarket/types'

import React from 'react'
import styled from 'styled-components'

import { TITLE, TITLE_MAPPER } from '@/constants'
import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Content } from '@/components/DetailsMarket/styles'
import AlertNoVaultSharesFound from '@/components/AlertNoVaultSharesFound'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserSupplyStakedUnstaked from '@/components/DetailsUser/components/DetailsUserSupplyStakedUnstaked'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

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

  // prettier-ignore
  const stats: Detail[][] = [
    [
      { titleKey: TITLE.tokenSupply, value: <CellToken {...cellProps} type="borrowed" module="supply" /> },
      { titleKey: TITLE.rateLend, value: <CellRate {...cellProps} type="supply" /> },
    ],
    [
      { titleKey: TITLE.vaultShares, value: <DetailsUserSupplyStakedUnstaked userActiveKey={userActiveKey} />, className: 'isRow' },
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
            <ListInfoItemsWrapper>
              {stats.map((detailSection, idx) => (
                <ListInfoItems key={`infos-${idx}`}>
                  {detailSection.map(({ show, value, titleKey, ...props }, idx) => {
                    if (!_showContent(show)) return null
                    return (
                      <ListInfoItem key={`info-${idx}`} {...props} title={TITLE_MAPPER[titleKey].name}>
                        {value}
                      </ListInfoItem>
                    )
                  })}
                </ListInfoItems>
              ))}
            </ListInfoItemsWrapper>
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
