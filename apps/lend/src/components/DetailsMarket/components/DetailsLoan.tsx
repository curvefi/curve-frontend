import React from 'react'
import { t } from '@lingui/macro'

import { TITLE } from '@/constants'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { ContentWrapper, DarkContent, SubTitle, Wrapper } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import CellBorrowRate from '@/components/SharedCellData/CellBorrowRate'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import CellRewards from '@/components/SharedCellData/CellRewards'
import CellToken from '@/components/SharedCellData/CellToken'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import DetailsLoanChartBalances from '@/components/DetailsMarket/components/DetailsLoanChartBalances'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

const DetailsLoan = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, market, titleMapper, userActiveKey } =
    pageProps
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const cellProps = {
    rChainId,
    rOwmId,
    market,
    size: 'md' as const,
  }

  const contents: { titleKey: TitleKey; content: React.ReactNode }[][] = [
    [
      { titleKey: TITLE.tokenCollateral, content: <CellToken {...cellProps} type="collateral" module="borrow" /> },
      { titleKey: TITLE.tokenBorrow, content: <CellToken {...cellProps} type="borrowed" module="borrow" /> },
      { titleKey: TITLE.rateBorrow, content: <CellBorrowRate {...cellProps} /> },
      { titleKey: TITLE.rateLend, content: <CellRewards {...cellProps} /> },
    ],
    [
      { titleKey: TITLE.available, content: <CellCap {...cellProps} type="available" /> },
      { titleKey: TITLE.totalDebt, content: <CellLoanTotalDebt {...cellProps} /> },
      { titleKey: TITLE.cap, content: <CellCap {...cellProps} type="cap" /> },
      { titleKey: TITLE.utilization, content: <CellCap {...cellProps} type="utilization" /> },
      { titleKey: TITLE.totalCollateralValue, content: <CellTotalCollateralValue {...cellProps} /> },
    ],
  ]

  return (
    <div>
      {/* stats */}
      <ContentWrapper paddingTop isBorderBottom>
        <ListInfoItemsWrapper>
          {contents.map((groupedContent, idx) => (
            <ListInfoItems key={`contents${idx}`}>
              {groupedContent.map(({ titleKey, content }, idx) => (
                <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                  {content}
                </ListInfoItem>
              ))}
            </ListInfoItems>
          ))}
        </ListInfoItemsWrapper>
      </ContentWrapper>

      <ContentWrapper isBorderBottom>
        {networks[rChainId]?.pricesData && !chartExpanded && (
          <Box padding="0 0 var(--spacing-normal)">
            <ChartOhlcWrapper rChainId={rChainId} rOwmId={rOwmId} userActiveKey={userActiveKey} />
          </Box>
        )}
        <DetailsLoanChartBalances
          rChainId={rChainId}
          rOwmId={rOwmId}
          market={market}
        />
      </ContentWrapper>

      <Wrapper>
        <ContentWrapper paddingTop>
          <DetailsContracts
            rChainId={rChainId}
            market={market}
            type={type}
          />
        </ContentWrapper>

        <DarkContent>
          <SubTitle>{t`Parameters`}</SubTitle>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="borrow" />
        </DarkContent>
      </Wrapper>
    </div>
  )
}

export default DetailsLoan
