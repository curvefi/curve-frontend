import React from 'react'
import styled from 'styled-components'

import { TITLE_MAPPER, TITLE } from '@/constants'
import { breakpoints } from '@/ui/utils'

import { Content, DarkContent } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellToken from '@/components/SharedCellData/CellToken'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import DetailsSupplyRewards from '@/components/DetailsMarket/components/DetailsSupplyRewards'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'

const DetailsSupply = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, owmDataCachedOrApi, borrowed_token, collateral_token } = pageProps

  const cellProps = {
    rChainId,
    rOwmId,
    owmDataCachedOrApi,
    size: 'md' as const,
  }

  const details: { titleKey: TitleKey; value: React.ReactNode }[][] = [
    [
      { titleKey: TITLE.tokenSupply, value: <CellToken {...cellProps} type="borrowed" module="supply" /> },
      { titleKey: TITLE.tokenCollateral, value: <CellToken {...cellProps} type="collateral" module="supply" /> },
    ],
    [
      { titleKey: TITLE.available, value: <CellCap {...cellProps} type="available" /> },
      { titleKey: TITLE.totalDebt, value: <CellLoanTotalDebt {...cellProps} /> },
      { titleKey: TITLE.cap, value: <CellCap {...cellProps} type="cap" /> },
      { titleKey: TITLE.totalLiquidity, value: <CellSupplyTotalLiquidity {...cellProps} /> },
    ],
  ]

  return (
    <Wrapper>
      {/* stats */}
      <Content paddingTop>
        <ListInfoItemsWrapper>
          {details.map((detailSection, idx) => (
            <ListInfoItems key={`infos-${idx}`}>
              {detailSection.map(({ value, titleKey, ...props }, idx) => (
                <ListInfoItem key={`info-${idx}`} {...props} title={TITLE_MAPPER[titleKey].name}>
                  {value}
                </ListInfoItem>
              ))}
            </ListInfoItems>
          ))}
        </ListInfoItemsWrapper>

        <DetailsSupplyRewards rChainId={rChainId} rOwmId={rOwmId} />
      </Content>

      <StyledDarkContent>
        <Box grid gridGap={3}>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="supply" />
          <div>
            <DetailsContracts
              rChainId={rChainId}
              owmDataCachedOrApi={owmDataCachedOrApi}
              borrowed_token={borrowed_token}
              collateral_token={collateral_token}
              type={type}
            />
          </div>
        </Box>
      </StyledDarkContent>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;

  @media (min-width: ${breakpoints.lg}rem) {
    grid-template-columns: 1fr auto;
  }
`

const StyledDarkContent = styled(DarkContent)`
  min-width: 18.75rem; //300px;
`

export default DetailsSupply
