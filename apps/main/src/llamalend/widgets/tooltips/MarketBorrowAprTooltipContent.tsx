import {
  BORROW_APR_DESCRIPTION,
  BORROW_RATE_TITLE,
  COLLATERAL_YIELD_TITLE,
  NET_BORROW_APR_DESCRIPTION,
  NET_BORROW_RATE_TITLE,
} from '@/llamalend/constants'
import { hasEstimatedNetBorrowApr } from '@/llamalend/llama.utils'
import Stack from '@mui/material/Stack'
import type { Nullish } from '@primitives/objects.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { t } from '@ui/lib/i18n'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketBorrowAprTooltipContentProps = {
  borrowApr: number | Nullish
  averageApr: number | Nullish
  totalBorrowApr: number | Nullish
  totalAverageBorrowApr: number | Nullish
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignRewards[] | Nullish
  rebasingYieldApr: number | Nullish
  collateralSymbol: string | Nullish
  isLoading?: boolean
}

export const MarketBorrowAprTooltipContent = ({
  borrowApr,
  totalBorrowApr,
  totalAverageBorrowApr,
  averageApr,
  periodLabel,
  extraRewards,
  rebasingYieldApr,
  collateralSymbol,
  isLoading,
}: MarketBorrowAprTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription text={BORROW_APR_DESCRIPTION} />

    {hasEstimatedNetBorrowApr({ totalBorrowApr, extraRewards, rebasingYieldApr }) && (
      <TooltipDescription text={NET_BORROW_APR_DESCRIPTION} />
    )}

    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={BORROW_RATE_TITLE}>{formatCappedRatePercent(borrowApr ?? 0)}</TooltipItem>
        <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
          {averageApr == null ? 'N/A' : formatCappedRatePercent(averageApr)}
        </TooltipItem>
      </TooltipItems>

      {!!extraRewards?.length && (
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
          <TooltipItem title={COLLATERAL_YIELD_TITLE}>{formatCappedRatePercent(-rebasingYieldApr)}</TooltipItem>
          {!!collateralSymbol && (
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatCappedRatePercent(-rebasingYieldApr)}
            </TooltipItem>
          )}
        </TooltipItems>
      )}

      {hasEstimatedNetBorrowApr({ totalBorrowApr, extraRewards, rebasingYieldApr }) && (
        <TooltipItems>
          <TooltipItem variant="primary" title={NET_BORROW_RATE_TITLE}>
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
