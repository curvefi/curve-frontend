import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { MarketType } from '@evm-ui/types/market'
import { formatCappedRatePercent } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketNetBorrowAprTooltipContentProps = {
  marketType: MarketType
  borrowApr: number | null | undefined
  averageApr: number | null | undefined
  totalBorrowApr: number | null | undefined
  totalAverageBorrowApr: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignRewards[]
  rebasingYieldApr: number | null | undefined
  collateralSymbol: string | null | undefined
  isLoading?: boolean
}

const messages: Record<MarketType, string> = {
  [MarketType.Lend]: t`The borrow rate is the cost related to your borrow and varies according to the monetary policy of the market.`,
  [MarketType.Mint]: t`The borrow rate is the cost related to your borrow and varies according to the market, borrow incentives and crvUSD's peg.`,
}

export const MarketNetBorrowAprTooltipContent = ({
  marketType,
  borrowApr,
  totalBorrowApr,
  totalAverageBorrowApr,
  averageApr,
  periodLabel,
  extraRewards,
  rebasingYieldApr,
  collateralSymbol,
  isLoading,
}: MarketNetBorrowAprTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription text={messages[marketType]} />

    {!!rebasingYieldApr && (
      <TooltipDescription
        text={t`Net borrow APR represents your effective borrowing cost after yields and incentives.`}
      />
    )}

    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={t`Borrow APR`}>{formatCappedRatePercent(borrowApr ?? 0)}</TooltipItem>
        <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
          {averageApr == null ? 'N/A' : formatCappedRatePercent(averageApr)}
        </TooltipItem>
      </TooltipItems>

      {extraRewards.length > 0 && (
        <TooltipItems secondary>
          <RewardsTooltipItems
            title={t`Borrowing incentives`}
            tooltipType="borrow"
            extraRewards={extraRewards}
            extraIncentives={[]}
          />
        </TooltipItems>
      )}

      {rebasingYieldApr != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`Yield bearing tokens`}>{formatCappedRatePercent(-rebasingYieldApr)}</TooltipItem>
          {!!collateralSymbol && (
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatCappedRatePercent(-rebasingYieldApr)}
            </TooltipItem>
          )}
        </TooltipItems>
      )}

      {totalBorrowApr != null && (extraRewards.length || rebasingYieldApr != null) && (
        <TooltipItems>
          <TooltipItem variant="primary" title={t`Net borrow APR`}>
            {formatCappedRatePercent(totalBorrowApr)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {totalAverageBorrowApr == null ? 'N/A' : formatCappedRatePercent(totalAverageBorrowApr)}
          </TooltipItem>
        </TooltipItems>
      )}
    </Stack>
  </TooltipWrapper>
)
