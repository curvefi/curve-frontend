import React from 'react'
import styled from 'styled-components'

import { TITLE } from '@/lend/constants'
import { breakpoints } from '@ui/utils'
import useStore from '@/lend/store/useStore'

import { ContentWrapper } from '@/lend/components/DetailsMarket/styles'
import AlertNoVaultSharesFound from '@/lend/components/AlertNoVaultSharesFound'
import CellUserMain from '@/lend/components/SharedCellData/CellUserMain'
import CellToken from '@/lend/components/SharedCellData/CellToken'
import DetailsConnectWallet from '@/lend/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserSupplyStakedUnstaked from '@/lend/components/DetailsUser/components/DetailsUserSupplyStakedUnstaked'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'

const DetailsUserSupply = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, userActiveKey, market, titleMapper } = pageProps

  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { signerAddress } = api ?? {}
  const { vaultShares, gauge } = userBalancesResp ?? {}

  const showConnectWallet = typeof signerAddress !== 'undefined' && !signerAddress
  const foundVaultShares = typeof vaultShares !== 'undefined' && (+vaultShares > 0 || +gauge > 0)

  const cellProps = {
    rChainId,
    rOwmId,
    isBold: true,
    market,
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
            <CellUserMain {...pageProps} market={market!} type="supply" />

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
