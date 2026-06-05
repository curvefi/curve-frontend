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
import { t } from '@ui-kit/lib/i18n'
import { formatNumber } from '@ui-kit/utils'

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
        <TotalBalancesValue
          tooltip={formatNumber(total, { abbreviate: false, fallback: '-' })}
          tooltipProps={{ noWrap: true }}
        >
          {total === null ? '?' : formatNumber(total, 'usd.notional')}
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
