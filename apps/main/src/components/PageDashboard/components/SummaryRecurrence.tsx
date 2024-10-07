import Spinner from '@/ui/Spinner'
import Stats from '@/ui/Stats'
import Chip from '@/ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import {
  StyledStats,
  SummaryInnerContent,
  SummarySpinnerWrapper,
  SummaryTitle,
  tooltipProps,
} from '@/components/PageDashboard/components/Summary'
import type { WalletDashboardData } from '@/components/PageDashboard/types'




const TotalRecurrence = ({
  title,
  dashboardLoading,
  walletAddress,
  walletDashboardData,
}: {
  title?: string
  dashboardLoading: boolean
  walletAddress: string
  walletDashboardData: WalletDashboardData | undefined
}) => {
  return (
    <div>
      {title && <SummaryTitle>{t`Total Daily Profits`}</SummaryTitle>}
      <SummaryInnerContent>
        {dashboardLoading && walletAddress && typeof walletDashboardData?.totalProfitUsd === 'undefined' && (
          <SummarySpinnerWrapper>
            <Spinner />
          </SummarySpinnerWrapper>
        )}
        {walletDashboardData?.totalBaseProfit && walletDashboardData?.totalBaseProfit > 0 ? (
          <StyledStats isOneLine isBorderBottom label={t`Base`}>
            <Chip size="md">{formatNumber(walletDashboardData?.totalBaseProfit)}</Chip>
          </StyledStats>
        ) : null}
        <StyledStats isOneLine isBorderBottom label="CRV">
          <Chip
            size="md"
            tooltip={`${formatNumber(1)} CRV = ${formatNumber(
              walletDashboardData?.totalCrvProfit?.price ?? '0',
              FORMAT_OPTIONS.USD
            )}`}
            tooltipProps={tooltipProps}
          >
            {formatNumber(walletDashboardData?.totalCrvProfit?.total ?? '0')}
          </Chip>
        </StyledStats>
        {walletDashboardData?.totalOtherProfit &&
          Object.entries(walletDashboardData.totalOtherProfit).map(([token, { price, symbol, total }]) => {
            if (total === 0) return null

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
        <Stats label={t`USD Total`} isOneLine>
          <Chip isBold size="md">
            ≈ {formatNumber(walletDashboardData?.totalProfitUsd, FORMAT_OPTIONS.USD)}
          </Chip>
        </Stats>
      </SummaryInnerContent>
    </div>
  )
}

export default TotalRecurrence
