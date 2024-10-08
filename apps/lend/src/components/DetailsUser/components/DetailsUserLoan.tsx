import React from 'react'
import styled from 'styled-components'

import { TITLE } from '@/constants'
import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'

import { ContentWrapper } from '@/components/DetailsMarket/styles'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import CellHealthStatus from '@/components/SharedCellData/CellHealthStatus'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import CellLlammaBalances from '@/components/SharedCellData/CellLlammaBalances'
import CellLiquidationRange from '@/components/SharedCellData/CellLiquidationRange'
import CellLoanState from '@/components/SharedCellData/CellLoanState'
import CellLoss from '@/components/SharedCellData/CellLoss'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserLoanAlertSoftLiquidation from '@/components/DetailsUser/components/DetailsUserLoanAlertSoftLiquidation'
import DetailsUserLoanChartBandBalances from '@/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import DetailsUserLoanChartLiquidationRange from '@/components/DetailsUser/components/DetailsUserLoanChartLiquidationRange'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'

const DetailsUserLoan = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, market, titleMapper, userActiveKey } = pageProps

  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  // TODO: handle error
  const { details: userLoanDetails } = userLoanDetailsResp ?? {}
  const { signerAddress } = api ?? {}

  const showConnectWallet = typeof signerAddress !== 'undefined' && !signerAddress
  const foundLoan = typeof loanExistsResp !== 'undefined' && loanExistsResp.loanExists
  const isSoftLiquidation = userLoanDetails?.status?.colorKey === 'soft_liquidation'

  const cellProps = {
    rChainId,
    rOwmId,
    isBold: true,
    market: market!,
    userActiveKey,
    size: 'md' as const,
  }

  // prettier-ignore
  const contents: { titleKey: TitleKey, content: React.ReactNode, show?: boolean }[][] = [
    [
      { titleKey: TITLE.healthStatus, content: <CellHealthStatus {...cellProps} type="status" /> },
      { titleKey: TITLE.healthPercent, content: <CellHealthStatus {...cellProps} type="percent"  /> },
    ],
    [
      { titleKey: TITLE.liquidationRange, content: <CellLiquidationRange {...cellProps} type='range' /> },
      { titleKey: TITLE.liquidationBandRange, content: <CellLiquidationRange {...cellProps} type='band' />, show: isAdvanceMode },
      { titleKey: TITLE.liquidationRangePercent, content: <CellLiquidationRange {...cellProps} type='bandPct' />, show: isAdvanceMode },
    ],
    [
      { titleKey: TITLE.lossCollateral, content: <CellLoanState {...cellProps} /> },
      { titleKey: TITLE.lossAmount, content: <CellLoss {...cellProps} type='amount' /> },
      { titleKey: TITLE.lossPercent, content: <CellLoss {...cellProps} type='percent' /> },
    ],
    [
      { titleKey: TITLE.llammaBalances, content: <CellLlammaBalances {...cellProps} /> }
    ]
  ]

  return (
    <div>
      {showConnectWallet ? (
        <DetailsConnectWallet />
      ) : foundLoan ? (
        <div>
          {isSoftLiquidation && (
            <AlertContent>
              <DetailsUserLoanAlertSoftLiquidation {...pageProps} />
            </AlertContent>
          )}

          <ContentWrapper paddingTop isBorderBottom>
            <StatsWrapper>
              <CellUserMain {...pageProps} market={market!} type="borrow" />

              {/* stats */}
              <ListInfoItemsWrapper>
                {contents.map((groupedContents, idx) => (
                  <ListInfoItems key={`contents${idx}`}>
                    {groupedContents.filter(({show}) => _showContent(show)).map(({ titleKey, content }, idx) => (
                      <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                        {content}
                      </ListInfoItem>
                    ))}
                  </ListInfoItems>
                ))}
              </ListInfoItemsWrapper>
            </StatsWrapper>
          </ContentWrapper>

          {/* CHARTS */}
          <ContentWrapper>
            {networks[rChainId]?.pricesData && !chartExpanded && (
              <Box padding="0 0 var(--spacing-normal)">
                <ChartOhlcWrapper rChainId={rChainId} rOwmId={rOwmId} userActiveKey={userActiveKey} />
              </Box>
            )}
            {isAdvanceMode ? (
              <DetailsUserLoanChartBandBalances {...pageProps} />
            ) : (
              <DetailsUserLoanChartLiquidationRange {...pageProps} />
            )}
          </ContentWrapper>
        </div>
      ) : (
        <ContentWrapper paddingTop>
          <AlertNoLoanFound alertType="" owmId={rOwmId} />
        </ContentWrapper>
      )}
    </div>
  )
}

const AlertContent = styled(ContentWrapper)`
  & {
    padding-top: var(--spacing-normal);
    padding-bottom: 0;
  }
`

const StatsWrapper = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
    align-items: flex-start;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    width: 100%;
  }
`

export default DetailsUserLoan
