import React from 'react'
import { t } from '@lingui/macro'

import { breakpoints } from '@/ui/utils'

import {
  Content,
  ContentStat,
  ContentStats,
  ContentStatTitle,
  ContentStatValue,
  DarkContent,
} from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import CellSupplyTotalLiquidity from '@/components/SharedCellData/CellSupplyTotalLiquidity'
import DetailsSupplyRewards from '@/components/DetailsMarket/components/DetailsSupplyRewards'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import styled from 'styled-components'

const DetailsSupply = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, owmDataCachedOrApi, borrowed_token, collateral_token } = pageProps

  const cellProps = {
    rChainId,
    rOwmId,
    owmDataCachedOrApi,
    size: 'md' as const,
  }

  const details = [
    [
      { title: t`Supply token`, value: <CellToken {...cellProps} type="borrowed" /> },
      { title: t`Lend APY`, value: <CellRate {...cellProps} type="supply" /> },
      { title: 'TVL', value: <CellSupplyTotalLiquidity {...cellProps} /> },
    ],
    [
      { title: t`Available`, value: <CellCap {...cellProps} type="available" /> },
      { title: t`Total Debt`, value: <CellLoanTotalDebt {...cellProps} /> },
      { title: t`Total supplied`, value: <CellCap {...cellProps} type="cap" /> },
      { title: t`Utilization %`, value: <CellCap {...cellProps} type="utilization" /> },
    ],
  ]

  return (
    <Wrapper>
      {/* stats */}
      <Content paddingTop>
        {details.map((detailSection) => {
          return (
            <ContentStats key={detailSection[0].title}>
              {detailSection.map(({ title, value }) => {
                return (
                  <ContentStat key={`detail-${title}`}>
                    <ContentStatTitle>{title}</ContentStatTitle>
                    <ContentStatValue>{value}</ContentStatValue>
                  </ContentStat>
                )
              })}
            </ContentStats>
          )
        })}

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
