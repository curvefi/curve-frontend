import type { Detail } from '@/components/DetailsMarket/types'

import { t } from '@lingui/macro'
import React from 'react'

import networks from '@/networks'
import useStore from '@/store/useStore'

import {
  Content,
  ContentStat,
  ContentStats,
  ContentStatTitle,
  ContentStatValue,
  DarkContent,
  SubTitle,
  Wrapper,
} from '@/components/DetailsMarket/styles'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import DetailsLoanChartBalances from '@/components/DetailsMarket/components/DetailsLoanChartBalances'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import Box from '@/ui/Box'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'

const DetailsLoan = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, owmDataCachedOrApi, borrowed_token, collateral_token, userActiveKey } = pageProps
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const cellProps = {
    rChainId,
    rOwmId,
    owmDataCachedOrApi,
    size: 'md' as const,
  }

  const details: Detail[][] = [
    [
      { title: t`Collateral`, value: <CellToken {...cellProps} type="collateral" /> },
      { title: t`Borrow`, value: <CellToken {...cellProps} type="borrowed" /> },
      { title: t`Lend APR`, value: <CellRate {...cellProps} type="supply" /> },
      { title: t`Borrow APY`, value: <CellRate {...cellProps} type="borrow" className="paddingLeft" /> },
      { title: t`Available`, value: <CellCap {...cellProps} type="available" /> },
    ],
    [
      { title: t`Total Debt`, value: <CellLoanTotalDebt {...cellProps} /> },
      { title: t`Total supplied`, value: <CellCap {...cellProps} type="cap" /> },
      { title: t`Utilization %`, value: <CellCap {...cellProps} type="utilization" /> },
      { title: t`Total Collateral Value`, value: <CellTotalCollateralValue {...cellProps} /> },
    ],
  ]

  return (
    <div>
      {/* stats */}
      <Content paddingTop isBorderBottom>
        {details.map((detailSection) => {
          return (
            <ContentStats key={detailSection[0].title}>
              {detailSection.map(({ title, value, className = '' }) => {
                return (
                  <ContentStat key={`detail-${title}`} className={className}>
                    <ContentStatTitle>{title}</ContentStatTitle>
                    <ContentStatValue>{value}</ContentStatValue>
                  </ContentStat>
                )
              })}
            </ContentStats>
          )
        })}
      </Content>

      <Content isBorderBottom>
        {networks[rChainId]?.pricesData && !chartExpanded && (
          <Box padding="0 0 var(--spacing-normal)">
            <ChartOhlcWrapper rChainId={rChainId} rOwmId={rOwmId} userActiveKey={userActiveKey} />
          </Box>
        )}
        <DetailsLoanChartBalances
          rChainId={rChainId}
          rOwmId={rOwmId}
          borrowed_token={borrowed_token}
          collateral_token={collateral_token}
        />
      </Content>

      <Wrapper>
        <Content paddingTop>
          <DetailsContracts
            rChainId={rChainId}
            owmDataCachedOrApi={owmDataCachedOrApi}
            borrowed_token={borrowed_token}
            collateral_token={collateral_token}
            type={type}
          />
        </Content>

        <DarkContent>
          <SubTitle>{t`Parameters`}</SubTitle>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="borrow" />
        </DarkContent>
      </Wrapper>
    </div>
  )
}

export default DetailsLoan
