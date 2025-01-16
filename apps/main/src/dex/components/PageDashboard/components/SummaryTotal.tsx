import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'

import {
  StyledTotalBalanceWrapper,
  SummaryInnerContent,
  SummarySpinnerWrapper,
} from '@/dex/components/PageDashboard/components/Summary'
import { Chip } from '@ui/Typography'
import Spinner from '@ui/Spinner'

const SummaryTotal: React.FC = () => {
  const { dashboardDataMapper, isValidAddress } = useDashboardContext()

  const total = useMemo(() => {
    if (typeof dashboardDataMapper === 'undefined') return null
    return Object.values(dashboardDataMapper).reduce((prev, { liquidityUsd }) => prev + +liquidityUsd, 0)
  }, [dashboardDataMapper])

  return (
    <StyledTotalBalanceWrapper style={{ gridArea: 'grid-summary-total-balance' }}>
      <H2>{t`Total Balances`}</H2>
      <SummaryInnerContent>
        {isValidAddress && total === null && (
          <SummarySpinnerWrapper isMain>
            <Spinner />
          </SummarySpinnerWrapper>
        )}
        <TotalBalancesValue tooltip={formatNumber(total)} tooltipProps={{ noWrap: true }}>
          {formatNumber(total, { currency: 'USD', notation: 'compact', defaultValue: '-' })}
        </TotalBalancesValue>
      </SummaryInnerContent>
    </StyledTotalBalanceWrapper>
  )
}

const TotalBalancesValue = styled(Chip)`
  font-size: var(--font-size-7);
  font-weight: bold;
`

const H2 = styled.h2`
  font-family: var(--button--font);
  font-size: var(--font-size-3);
  margin-bottom: 0.25rem;
`

export default SummaryTotal
