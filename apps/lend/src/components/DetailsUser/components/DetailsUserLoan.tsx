import Box from '@/ui/Box'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import { breakpoints } from '@/ui/utils'
import React from 'react'
import styled from 'styled-components'

import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import { ContentWrapper } from '@/components/DetailsMarket/styles'

import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserLoanAlertSoftLiquidation from '@/components/DetailsUser/components/DetailsUserLoanAlertSoftLiquidation'
import DetailsUserLoanChartBandBalances from '@/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import DetailsUserLoanChartLiquidationRange from '@/components/DetailsUser/components/DetailsUserLoanChartLiquidationRange'
import CellHealthStatus from '@/components/SharedCellData/CellHealthStatus'
import CellLiquidationRange from '@/components/SharedCellData/CellLiquidationRange'
import CellLlammaBalances from '@/components/SharedCellData/CellLlammaBalances'
import CellLoanState from '@/components/SharedCellData/CellLoanState'
import CellLoss from '@/components/SharedCellData/CellLoss'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import { TITLE } from '@/constants'
import networks from '@/networks'
import useStore from '@/store/useStore'
import { _showContent } from '@/utils/helpers'

const DetailsUserLoan = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, owmDataCachedOrApi, titleMapper, userActiveKey } = pageProps

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
    owmDataCachedOrApi,
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
              <CellUserMain {...pageProps} type="borrow" />

              {/* stats */}
              <ListInfoItemsWrapper>
                {contents.map((groupedContents, idx) => (
                  <ListInfoItems key={`contents${idx}`}>
                    {groupedContents.map(({ titleKey, content, show, ...props }, idx) => {
                      if (!_showContent(show)) return null
                      return (
                        <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                          {content}
                        </ListInfoItem>
                      )
                    })}
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
