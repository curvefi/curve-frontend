import type { TooltipProps } from '@/ui/Tooltip/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { _showContent } from '@/utils/helpers'
import { breakpoints } from '@/ui/utils'
import useStore from '@/store/useStore'
import networks from '@/networks'

import { Content } from '@/components/DetailsMarket/styles'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import CellHealthStatus from '@/components/SharedCellData/CellHealthStatus'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import CellLlammaBalances from '@/components/SharedCellData/CellLlammaBalances'
import CellLiquidationRange from '@/components/SharedCellData/CellLiquidationRange'
import CellLoanState from '@/components/SharedCellData/CellLoanState'
import CellLoss from '@/components/SharedCellData/CellLoss'
import CellRate from '@/components/SharedCellData/CellRate'
import ExternalLink from 'ui/src/Link/ExternalLink'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserLoanAlertSoftLiquidation from '@/components/DetailsUser/components/DetailsUserLoanAlertSoftLiquidation'
import DetailsUserLoanChartBandBalances from '@/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import DetailsUserLoanChartLiquidationRange from '@/components/DetailsUser/components/DetailsUserLoanChartLiquidationRange'
import ChartOhlcWrapper from '@/components/ChartOhlcWrapper'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import TextCaption from '@/ui/TextCaption'

type Content = {
  title: React.ReactNode | string
  value: React.ReactNode
  tooltip?: React.ReactNode | string
  tooltipProps?: TooltipProps
  className?: string
  show?: boolean
}

const DetailsUserLoan = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, owmDataCachedOrApi, userActiveKey } = pageProps

  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)

  // TODO: handle error
  const { details: userLoanDetails } = userLoanDetailsResp ?? {}
  const { signerAddress } = api ?? {}
  const { symbol: collateralSymbol = '' } = owmDataCachedOrApi?.owm?.collateral_token ?? {}

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
  const stats: Content[][] = [
    [
      { title: t`Status`, value: <CellHealthStatus {...cellProps} type="status" /> },
      {
        title: t`Health`,
        tooltip: (
          <Box grid gridGap={2}>
            <p>{t`The loan metric indicates the current health of your position.`}</p>
            <p>
              {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
              <ExternalLink href="https://resources.curve.fi/lending/overview/#health-hard-liquidation" $noStyles>
                Click here to learn more.
              </ExternalLink>
            </p>
          </Box>
        ),
        tooltipProps: { minWidth: '250px' },
        value: <CellHealthStatus {...cellProps} type="percent"  />
      },
      { title: t`Borrow APY`, value: <CellRate {...cellProps} type="borrow" /> }
    ],
    [
      { title: t`Liquidation range`, value: <CellLiquidationRange {...cellProps} type='range' /> },
      { title: t`Band range`, value: <CellLiquidationRange {...cellProps} type='band' />, show: isAdvanceMode },
      { title: t`Range %`, value: <CellLiquidationRange {...cellProps} type='bandPct' />, show: isAdvanceMode },
    ],
    [
      { title: <>{t`Collateral`} <TextCaption isCaps={false}>({collateralSymbol})</TextCaption><br/>{t`Current balance (est.) / Deposited`}</>, tooltip: t`Current balance (est.) is current balance minus losses.`, value: <CellLoanState {...cellProps} />, className: 'isRow' },
      { title: t`Loss amount`, value: <CellLoss {...cellProps} type='amount' />, className: 'isRow' },
      { title: t`% Lost`, tooltip: t`This metric measures the loss in collateral value caused by LLAMMA's soft liquidation process, which is activated when the oracle price falls within a user’s liquidation range.`, tooltipProps: {minWidth: '250px'}, value: <CellLoss {...cellProps} type='percent' />, className: 'isRow' },
    ],
    [
      { title: t`LLAMMA Balances`, value: <CellLlammaBalances {...cellProps} /> }
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

          <Content paddingTop isBorderBottom>
            <StatsWrapper>
              <CellUserMain {...cellProps} type="borrow" />

              {/* stats */}
              <ListInfoItemsWrapper>
                {stats.map((detailSection, idx) => (
                  <ListInfoItems key={`info-${idx}`}>
                    {detailSection.map(({ value, show, ...props }, idx) => {
                      if (!_showContent(show)) return null
                      return (
                        <ListInfoItem key={`info-${idx}`} {...props}>
                          {value}
                        </ListInfoItem>
                      )
                    })}
                  </ListInfoItems>
                ))}
              </ListInfoItemsWrapper>
            </StatsWrapper>
          </Content>

          {/* CHARTS */}
          <Content>
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
          </Content>
        </div>
      ) : (
        <Content paddingTop>
          <AlertNoLoanFound alertType="" owmId={rOwmId} />
        </Content>
      )}
    </div>
  )
}

const AlertContent = styled(Content)`
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
