import { useMemo } from 'react'
import {
  StyledStats,
  SummaryTitle,
  SummaryInnerContent,
  SummarySpinnerWrapper,
} from '@/dex/components/PageDashboard/components/Summary'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { Spinner } from '@ui/Spinner'
import { Stats } from '@ui/Stats'
import { Chip } from '@ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { tooltipProps } from '../utils'

type AllTotal = {
  totalUsd: number
  tokens: { [token: string]: { symbol: string; total: number; price: number } }
}

type Props = {
  title?: string
}

export const SummaryClaimable = ({ title }: Props) => {
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
          Object.entries(tokens).map(([token, { symbol, total, price }]) => (
            <StyledStats isOneLine isBorderBottom key={token} label={symbol}>
              <Chip
                size="md"
                tooltip={`${formatNumber(1)} ${symbol} = ${formatNumber(price, FORMAT_OPTIONS.USD)}`}
                tooltipProps={tooltipProps}
              >
                {formatNumber(total)}
              </Chip>
            </StyledStats>
          ))}
        <Stats isOneLine label={t`USD Total`}>
          <Chip isBold isNumber size="md">
            ≈ {formatNumber(totalUsd, FORMAT_OPTIONS.USD)}
          </Chip>
        </Stats>
      </SummaryInnerContent>
    </div>
  )
}
