import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { useDashboardContext } from '@/components/PageDashboard/dashboardContext'

import {
  StyledStats,
  SummaryTitle,
  SummaryInnerContent,
  SummarySpinnerWrapper,
  tooltipProps,
} from '@/components/PageDashboard/components/Summary'
import Chip from '@/ui/Typography/Chip'
import Spinner from '@/ui/Spinner'
import Stats from '@/ui/Stats'

type AllTotal = {
  totalUsd: number
  tokens: { [token: string]: { symbol: string; total: number; price: number } }
}

type Props = {
  title?: string
}

const SummaryClaimable: React.FC<Props> = ({ title }) => {
  const {
    isLoading,
    formValues: { walletAddress },
    dashboardDataMapper,
  } = useDashboardContext()

  const { totalUsd, tokens } = useMemo(() => {
    if (typeof dashboardDataMapper === 'undefined') return {} as AllTotal

    let totalUsd = 0
    const allTotal = Object.values(dashboardDataMapper).reduce(
      (prev, { claimableCrv = [], claimableOthers, claimablesTotalUsd }) => {
        // crv
        claimableCrv.forEach(({ amount, price }) => {
          if (typeof prev.tokens['crv'] === 'undefined') {
            prev.tokens['crv'] = { symbol: 'CRV', total: Number(amount), price }
          } else {
            prev.tokens['crv'].total += Number(amount)
          }
        })

        // others
        claimableOthers.forEach(({ amount, price, symbol, token }) => {
          if (typeof prev.tokens[token] === 'undefined') {
            prev.tokens[token] = { symbol, total: Number(amount), price }
          } else {
            prev.tokens[token].total += Number(amount)
          }
        })
        totalUsd += claimablesTotalUsd
        return prev
      },
      { totalUsd: 0, tokens: {} } as AllTotal,
    )

    return { ...allTotal, totalUsd }
  }, [dashboardDataMapper])

  return (
    <div className="grid-claimable-tokens">
      {title && <SummaryTitle>{title}</SummaryTitle>}
      <SummaryInnerContent>
        {isLoading && !!walletAddress && typeof totalUsd === 'undefined' && (
          <SummarySpinnerWrapper>
            <Spinner />
          </SummarySpinnerWrapper>
        )}
        {tokens &&
          Object.entries(tokens).map(([token, { symbol, total, price }]) => {
            return (
              <StyledStats isOneLine isBorderBottom key={token} label={symbol}>
                <Chip
                  size="md"
                  tooltip={`${formatNumber(1)} ${symbol} = ${formatNumber(price, FORMAT_OPTIONS.USD)}`}
                  tooltipProps={tooltipProps}
                >
                  {formatNumber(total)}
                </Chip>
              </StyledStats>
            )
          })}
        <Stats isOneLine label={t`USD Total`}>
          <Chip isBold isNumber size="md">
            ≈ {formatNumber(totalUsd, FORMAT_OPTIONS.USD)}
          </Chip>
        </Stats>
      </SummaryInnerContent>
    </div>
  )
}

export default SummaryClaimable
