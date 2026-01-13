import { useMemo } from 'react'
import { styled } from 'styled-components'
import {
  StyledTotalBalanceWrapper,
  SummaryInnerContent,
  SummarySpinnerWrapper,
} from '@/dex/components/PageDashboard/components/Summary'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { Spinner } from '@ui/Spinner'
import { Chip } from '@ui/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const SummaryTotal = () => {
  const { dashboardDataMapper, isValidAddress } = useDashboardContext()
  const { isLoading } = useDashboardContext()

  const total = useMemo(() => {
    if (typeof dashboardDataMapper === 'undefined') return null
    return Object.values(dashboardDataMapper).reduce((prev, { liquidityUsd }) => prev + +liquidityUsd, 0)
  }, [dashboardDataMapper])

  return (
    <StyledTotalBalanceWrapper style={{ gridArea: 'grid-summary-total-balance' }}>
      <H2>{t`Total Balances`}</H2>
      <SummaryInnerContent>
        {isValidAddress && isLoading && (
          <SummarySpinnerWrapper isMain>
            <Spinner />
          </SummarySpinnerWrapper>
        )}
        <TotalBalancesValue tooltip={formatNumber(total)} tooltipProps={{ noWrap: true }}>
          {total === null ? '?' : formatNumber(total, { currency: 'USD', notation: 'compact', defaultValue: '-' })}
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
