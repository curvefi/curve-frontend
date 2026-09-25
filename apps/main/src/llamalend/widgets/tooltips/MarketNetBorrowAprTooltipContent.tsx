import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { MarketType } from '@evm-ui/types/market'
import { formatCappedRatePercent } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import type { Nullish } from '@primitives/objects.utils'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketNetBorrowAprTooltipContentProps = {
  marketType: MarketType
  borrowApr: number | Nullish
  averageApr: number | Nullish
  totalBorrowApr: number | Nullish
  totalAverageBorrowApr: number | Nullish
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignRewards[]
  rebasingYieldApr: number | Nullish
  collateralSymbol: string | Nullish
  isLoading?: boolean
}

export const MarketNetBorrowAprTooltipContent = ({
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
    <TooltipDescription
      text={t`Borrow APR is the interest charged on the debt. It follows the market’s monetary policy. On mint markets it also follows crvUSD’s peg and borrow incentives. It does not include collateral yield.`}
    />
    <TooltipDescription
      text={t`Estimated net borrow APR subtracts collateral yield and incentives from Borrow APR. That estimate is a same-asset comparison only when the yield is paid in the debt asset. When it is not, as with wstETH yield against crvUSD debt, it is not the borrow cost.`}
    />

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
          <TooltipItem variant="primary" title={t`Estimated net borrow APR`}>
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
