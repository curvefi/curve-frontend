import type { Detail } from '@/components/DetailsMarket/types'

import React from 'react'
import { t } from '@lingui/macro'

import { TITLE, TITLE_MAPPER } from '@/constants'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { Content, DarkContent, SubTitle, Wrapper } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import CellRate from '@/components/SharedCellData/CellRate'
import CellToken from '@/components/SharedCellData/CellToken'
import CellCap from '@/components/SharedCellData/CellCap'
import CellLoanTotalDebt from '@/components/SharedCellData/CellLoanTotalDebt'
import DetailsLoanChartBalances from '@/components/DetailsMarket/components/DetailsLoanChartBalances'
import DetailsContracts from '@/components/DetailsMarket/components/DetailsContracts'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import CellTotalCollateralValue from '@/components/SharedCellData/CellTotalCollateralValue'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

const DetailsLoan = ({ type, ...pageProps }: PageContentProps & { type: MarketListType }) => {
  const { rChainId, rOwmId, owmDataCachedOrApi, borrowed_token, collateral_token, userActiveKey } = pageProps
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const cellProps = {
    rChainId,
    rOwmId,
    owmDataCachedOrApi,
    size: 'md' as const,
  }

  const details: { titleKey: TitleKey; value: React.ReactNode }[][] = [
    [
      { titleKey: TITLE.tokenCollateral, value: <CellToken {...cellProps} type="collateral" module="borrow" /> },
      { titleKey: TITLE.tokenBorrow, value: <CellToken {...cellProps} type="borrowed" module="borrow" /> },
      { titleKey: TITLE.rateBorrow, value: <CellRate {...cellProps} type="borrow" className="paddingLeft" /> },
    ],
    [
      { titleKey: TITLE.available, value: <CellCap {...cellProps} type="available" /> },
      { titleKey: TITLE.totalDebt, value: <CellLoanTotalDebt {...cellProps} /> },
      { titleKey: TITLE.cap, value: <CellCap {...cellProps} type="cap" /> },
      { titleKey: TITLE.utilization, value: <CellCap {...cellProps} type="utilization" /> },
      { titleKey: TITLE.totalCollateralValue, value: <CellTotalCollateralValue {...cellProps} /> },
    ],
  ]

  return (
    <div>
      {/* stats */}
      <Content paddingTop isBorderBottom>
        <ListInfoItemsWrapper>
          {details.map((detailSection, idx) => (
            <ListInfoItems key={`infos-${idx}`}>
              {detailSection.map(({ value, titleKey, ...props }, idx) => (
                <ListInfoItem key={`info-${idx}`} title={TITLE_MAPPER[titleKey].name} {...props}>
                  {value}
                </ListInfoItem>
              ))}
            </ListInfoItems>
          ))}
        </ListInfoItemsWrapper>
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
