import type { Detail } from '@/components/DetailsMarket/types'

import React, { useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import isUndefined from 'lodash/isUndefined'
import styled from 'styled-components'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { breakpoints } from '@/ui/utils'
import { getHealthMode } from '@/components/DetailInfoHealth'
import useStore from '@/store/useStore'

import {
  Content,
  ContentStat,
  ContentStats,
  ContentStatTitle,
  ContentStatValue,
} from '@/components/DetailsMarket/styles'
import AlertNoLoanFound from '@/components/AlertNoLoanFound'
import Box from '@/ui/Box'
import CellHealthStatus from '@/components/SharedCellData/CellHealthStatus'
import CellUserMain from '@/components/SharedCellData/CellUserMain'
import CellLiquidationRange from '@/components/SharedCellData/CellLiquidationRange'
import CellLoanState from '@/components/SharedCellData/CellLoanState'
import CellRate from '@/components/SharedCellData/CellRate'
import DetailsConnectWallet from '@/components/DetailsUser/components/DetailsConnectWallet'
import DetailsUserLoanAlertSoftLiquidation from '@/components/DetailsUser/components/DetailsUserLoanAlertSoftLiquidation'
import DetailsUserLoanChartBandBalances from '@/components/DetailsUser/components/DetailsUserLoanChartBandBalances'
import DetailsUserLoanChartLiquidationRange from '@/components/DetailsUser/components/DetailsUserLoanChartLiquidationRange'

const DetailsUserLoan = (pageProps: PageContentProps) => {
  const { rChainId, rOwmId, api, owmDataCachedOrApi, userActiveKey } = pageProps

  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanDetailsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId]?.bands)
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)

  // TODO: handle error
  const { details: userLoanDetails } = userLoanDetailsResp ?? {}
  const { activeBand } = loanDetailsBands ?? {}
  const { signerAddress } = api ?? {}

  const showConnectWallet = typeof signerAddress !== 'undefined' && !signerAddress
  const foundLoan = typeof loanExistsResp !== 'undefined' && loanExistsResp.loanExists
  const isSoftLiquidation = userLoanDetails?.status?.colorKey === 'soft_liquidation'

  useEffect(() => {
    if (!isUndefined(activeBand) && userLoanDetails) {
      const fetchedHealthMode = getHealthMode(
        activeBand,
        '',
        userLoanDetails.bands,
        '',
        userLoanDetails.healthFull,
        userLoanDetails.healthNotFull,
        false,
        '',
        ''
      )
      setHealthMode(fetchedHealthMode)
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [activeBand, userLoanDetails])

  const cellProps = {
    rChainId,
    rOwmId,
    isBold: true,
    owmDataCachedOrApi,
    userActiveKey,
    size: 'md' as const,
  }

  // prettier-ignore
  const stats: Detail[][] = [
    [
      { title: t`Status`, value: <CellHealthStatus {...cellProps} healthPercent={healthMode.percent}  type="status"  /> },
      { title: t`Health`, value: <CellHealthStatus {...cellProps} healthPercent={healthMode.percent} type="percent"  /> },
      { title: t`Borrow APR`, value: <CellRate {...cellProps} type="borrow" /> }
    ],
    [
      { title: t`Liquidation range`, value: <CellLiquidationRange {...cellProps} type='range' /> },
      { title: t`Band range`, value: <CellLiquidationRange {...cellProps} type='band' />, show: isAdvanceMode },
      { title: t`Range %`, value: <CellLiquidationRange {...cellProps} type='bandPct' />, show: isAdvanceMode },
    ],
    [
      { title: t`AMM position state`, value: <CellLoanState {...cellProps} />, className: 'isRow' },
    ]
  ]

  return (
    <div>
      {showConnectWallet ? (
        <DetailsConnectWallet />
      ) : foundLoan ? (
        <Wrapper>
          {isSoftLiquidation && (
            <AlertContent>
              <DetailsUserLoanAlertSoftLiquidation {...pageProps} />
            </AlertContent>
          )}

          <Content paddingTop isBorderBottom>
            <StatsWrapper>
              <CellUserMain {...cellProps} type="borrow" />

              {/* stats */}
              <Box>
                {stats.map((detailSection) => {
                  return (
                    <ContentStats key={detailSection[0].title}>
                      {detailSection.map(({ className = '', title, value, show }) => {
                        const showContent = typeof show === 'undefined' || (typeof show !== 'undefined' && show)
                        return (
                          showContent && (
                            <ContentStat className={className} key={`detail-${title}`}>
                              <ContentStatTitle>{title}</ContentStatTitle>
                              <ContentStatValue>{value}</ContentStatValue>
                            </ContentStat>
                          )
                        )
                      })}
                    </ContentStats>
                  )
                })}
              </Box>
            </StatsWrapper>
          </Content>

          {/* CHARTS */}
          <Content>
            {isAdvanceMode ? (
              <DetailsUserLoanChartBandBalances {...pageProps} />
            ) : (
              <DetailsUserLoanChartLiquidationRange {...pageProps} healthMode={healthMode} />
            )}
          </Content>
        </Wrapper>
      ) : (
        <Content paddingTop>
          <AlertNoLoanFound
            hideLink={window?.location?.hash?.includes('manage')}
            owmId={rOwmId}
            userActiveKey={userActiveKey}
          />
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

const Wrapper = styled.div`
  @media (min-width: ${breakpoints.sm}rem) {
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
