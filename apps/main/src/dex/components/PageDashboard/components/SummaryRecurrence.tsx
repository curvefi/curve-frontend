import { useMemo } from 'react'
import {
  StyledStats,
  SummaryInnerContent,
  SummarySpinnerWrapper,
  SummaryTitle,
} from '@/dex/components/PageDashboard/components/Summary'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { Spinner } from '@ui/Spinner'
import { Stats } from '@ui/Stats'
import { Chip } from '@ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { tooltipProps } from '../utils'

type TotalOtherProfit = {
  [token: string]: { symbol: string; day: number; price: number }
}

type TotalAll = {
  tokens: TotalOtherProfit
  totalUsd: number
}

type Props = { title?: string }

export const TotalRecurrence = ({ title }: Props) => {
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
