
import Spinner from '@/ui/Spinner'
import Stats from '@/ui/Stats'
import Chip from '@/ui/Typography/Chip'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'

import {
  StyledStats,
  SummaryTitle,
  SummaryInnerContent,
  SummarySpinnerWrapper,
  tooltipProps,
} from '@/components/PageDashboard/components/Summary'

import type { WalletDashboardData } from '@/components/PageDashboard/types'

const SummaryClaimable = ({
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
    <div className="grid-claimable-tokens">
      {title && <SummaryTitle>{title}</SummaryTitle>}
      <SummaryInnerContent>
        {dashboardLoading && !!walletAddress && typeof walletDashboardData?.totalClaimableUsd === 'undefined' && (
          <SummarySpinnerWrapper>
            <Spinner />
          </SummarySpinnerWrapper>
        )}
        <StyledStats isOneLine isBorderBottom label="CRV">
          <Chip
            isNumber
            size="md"
            tooltip={`${formatNumber(1)} CRV = ${formatNumber(
              walletDashboardData?.totalClaimableCrv?.price ?? '0',
              FORMAT_OPTIONS.USD
            )}`}
            tooltipProps={tooltipProps}
          >
            {formatNumber(walletDashboardData?.totalClaimableCrv?.total ?? '0')}
          </Chip>
        </StyledStats>
        {walletDashboardData?.totalClaimableOther &&
          Object.entries(walletDashboardData.totalClaimableOther).map(([token, { symbol, total, price }]) => {
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
            ≈ {formatNumber(walletDashboardData?.totalClaimableUsd, FORMAT_OPTIONS.USD)}
          </Chip>
        </Stats>
      </SummaryInnerContent>
    </div>
  )
}

export default SummaryClaimable
