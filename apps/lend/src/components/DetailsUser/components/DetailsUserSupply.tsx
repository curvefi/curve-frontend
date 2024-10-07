import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import { breakpoints } from '@/ui/utils'
import React from 'react'
import styled from 'styled-components'


import AlertNoVaultSharesFound from '@/components/AlertNoVaultSharesFound'
import { ContentWrapper } from '@/components/DetailsMarket/styles'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserSupplyStakedUnstaked from '@/components/DetailsUser/components/DetailsUserSupplyStakedUnstaked'
import CellToken from '@/components/SharedCellData/CellToken'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import { TITLE } from '@/constants'
import useStore from '@/store/useStore'

const DetailsUserSupply = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, userActiveKey, owmDataCachedOrApi, titleMapper } = pageProps

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
  const contents: { titleKey: TitleKey, content: React.ReactNode }[][] = [
    [
      { titleKey: TITLE.tokenSupply, content: <CellToken {...cellProps} type="borrowed" module="supply" /> },
    ],
    [
      { titleKey: TITLE.vaultShares, content: <DetailsUserSupplyStakedUnstaked userActiveKey={userActiveKey} /> },
    ],
  ]

  return (
    <div>
      {showConnectWallet ? (
        <DetailsConnectWallet />
      ) : foundVaultShares ? (
        <ContentWrapper paddingTop>
          <Wrapper>
            <CellUserMain {...pageProps} type="supply" />

            {/* stats */}
            <ListInfoItemsWrapper>
              {contents.map((groupedContents, idx) => (
                <ListInfoItems key={`contents${idx}`}>
                  {groupedContents.map(({ titleKey, content }, idx) => (
                    <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                      {content}
                    </ListInfoItem>
                  ))}
                </ListInfoItems>
              ))}
            </ListInfoItemsWrapper>
          </Wrapper>
        </ContentWrapper>
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
