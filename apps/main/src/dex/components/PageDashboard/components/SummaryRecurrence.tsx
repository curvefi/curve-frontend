import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'

import {
  StyledStats,
  SummaryInnerContent,
  SummarySpinnerWrapper,
  SummaryTitle,
  tooltipProps,
} from '@/dex/components/PageDashboard/components/Summary'
import Chip from '@ui/Typography/Chip'
import Stats from '@ui/Stats'
import Spinner from '@ui/Spinner'

type TotalOtherProfit = {
  [token: string]: { symbol: string; day: number; price: number }
}

type TotalAll = {
  tokens: TotalOtherProfit
  totalUsd: number
}

type Props = { title?: string }

const TotalRecurrence: React.FC<Props> = ({ title }) => {
  const {
    isLoading,
    formValues: { walletAddress },
    dashboardDataMapper,
  } = useDashboardContext()

  const { tokens, totalUsd } = useMemo(() => {
    if (typeof dashboardDataMapper === 'undefined') return {} as TotalAll

    return Object.values(dashboardDataMapper).reduce(
      (prev, { profitBase, profitCrv, profitOthers, profitsTotalUsd }) => {
        if (profitBase) {
          prev.tokens['base'] = { symbol: t`Base`, day: Number(profitBase.day), price: 1 }
        }

        if (profitCrv) {
          const { day, price } = profitCrv
          if (typeof prev.tokens['CRV'] === 'undefined') {
            prev.tokens['CRV'] = { symbol: 'CRV', day: Number(day), price }
          } else {
            prev.tokens['CRV'].day += Number(day)
          }
        }

        profitOthers.forEach(({ symbol, token, day, price }) => {
          if (typeof prev.tokens[token] === 'undefined') {
            prev.tokens[token] = { symbol, day: Number(day), price }
          } else {
            prev.tokens[token].day += Number(day)
          }
        })

        prev.totalUsd += profitsTotalUsd
        return prev
      },
      { tokens: {}, totalUsd: 0 } as TotalAll,
    )
  }, [dashboardDataMapper])

  return (
    <div>
      {title && <SummaryTitle>{t`Total Daily Profits`}</SummaryTitle>}
      <SummaryInnerContent>
        {isLoading && !!walletAddress && typeof totalUsd === 'undefined' && (
          <SummarySpinnerWrapper>
            <Spinner />
          </SummarySpinnerWrapper>
        )}

        {tokens &&
          Object.entries(tokens).map(([token, { price, symbol, day }]) => {
            if (day === 0) return null

            return (
              <StyledStats isOneLine isBorderBottom key={token} label={symbol}>
                <Chip
                  size="md"
                  {...(token === 'base'
                    ? {}
                    : {
                        tooltip: `${formatNumber(1)} ${symbol} = ${formatNumber(price, FORMAT_OPTIONS.USD)}`,
                        tooltipProps,
                      })}
                >
                  {formatNumber(day)}
                </Chip>
              </StyledStats>
            )
          })}

        <Stats label={t`USD Total`} isOneLine>
          <Chip isBold size="md">
            ≈ {formatNumber(totalUsd, FORMAT_OPTIONS.USD)}
          </Chip>
        </Stats>
      </SummaryInnerContent>
    </div>
  )
}

export default TotalRecurrence
