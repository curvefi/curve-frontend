import { ReactNode } from 'react'
import styled from 'styled-components'
import AlertNoLoanFound from '@/lend/components/AlertNoLoanFound'
import ChartOhlcWrapper from '@/lend/components/ChartOhlcWrapper'
import { ContentWrapper } from '@/lend/components/DetailsMarket/styles'
import DetailsConnectWallet from '@/lend/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserLoanAlertSoftLiquidation from '@/lend/components/DetailsUser/components/DetailsUserLoanAlertSoftLiquidation'
import DetailsUserLoanChartBandBalances from '@/lend/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import DetailsUserLoanChartLiquidationRange from '@/lend/components/DetailsUser/components/DetailsUserLoanChartLiquidationRange'
// import { UserInfoPnl } from '@/lend/components/DetailsUser/components/UserInfoPnl'
import { UserInfoLeverage } from '@/lend/components/DetailsUser/components/UserInfoLeverage'
import CellHealthStatus from '@/lend/components/SharedCellData/CellHealthStatus'
import CellLiquidationRange from '@/lend/components/SharedCellData/CellLiquidationRange'
import CellLlammaBalances from '@/lend/components/SharedCellData/CellLlammaBalances'
import CellLoanState from '@/lend/components/SharedCellData/CellLoanState'
import CellLoss from '@/lend/components/SharedCellData/CellLoss'
import CellUserMain from '@/lend/components/SharedCellData/CellUserMain'
import { TITLE } from '@/lend/constants'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { PageContentProps, TitleKey } from '@/lend/types/lend.types'
import { _showContent } from '@/lend/utils/helpers'
import Box from '@ui/Box'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import { breakpoints } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailsUserLoan = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, market, titleMapper, userActiveKey } = pageProps

  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  // TODO: handle error
  const { details: userLoanDetails } = userLoanDetailsResp ?? {}
  const { signerAddress } = api ?? {}

  const pricesApiAvailable = networks[rChainId]?.pricesData
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
  const contents: { titleKey: TitleKey, content: ReactNode, show?: boolean }[][] = [
    [
      { titleKey: TITLE.healthStatus, content: <CellHealthStatus {...cellProps} type="status" /> },
      { titleKey: TITLE.healthPercent, content: <CellHealthStatus {...cellProps} type="percent"  /> },
      ...(pricesApiAvailable ? [
        // { titleKey: TITLE.profitAndLoss, content: <UserInfoPnl userActiveKey={userActiveKey} /> },
        { titleKey: TITLE.positionCurrentLeverage, content: <UserInfoLeverage userActiveKey={userActiveKey} /> },
      ] : []),
    ],
    [
      { titleKey: TITLE.liquidationRange, content: <CellLiquidationRange {...cellProps} type='range' /> },
      { titleKey: TITLE.liquidationBandRange, content: <CellLiquidationRange {...cellProps} type='band' />, show: isAdvancedMode },
      { titleKey: TITLE.liquidationRangePercent, content: <CellLiquidationRange {...cellProps} type='bandPct' />, show: isAdvancedMode },
    ],
    [
      { titleKey: TITLE.lossCollateral, content: <CellLoanState {...cellProps} /> },
      ...(pricesApiAvailable ? [
        { titleKey: TITLE.lossAmount, content: <CellLoss {...cellProps} type='amount' /> },
        { titleKey: TITLE.lossPercent, content: <CellLoss {...cellProps} type='percent' /> },
      ] : []),
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
              <CellUserMain {...pageProps} market={cellProps.market} type="borrow" />

              {/* stats */}
              <ListInfoItemsWrapper>
                {contents.map((groupedContents, idx) => (
                  <ListInfoItems key={`contents${idx}`}>
                    {groupedContents
                      .filter(({ show }) => _showContent(show))
                      .map(({ titleKey, content }, idx) => (
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
            {isAdvancedMode ? (
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
