import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import Stack from '@mui/material/Stack'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent } from '@ui-kit/utils'
import { RewardsTooltipItems } from './RewardTooltipItems'

export type MarketBorrowRateTooltipContentProps = {
  marketType: LlamaMarketType
  borrowRate: number | null | undefined
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignPoolRewards[]
  rebasingYield: number | null | undefined
  collateralSymbol: string | null | undefined
  isLoading?: boolean
}

const messages: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`The net borrow APR is the total cost related to your borrow and varies according to the monetary policy of the market.`,
  [LlamaMarketType.Mint]: t`The net borrow APR is the total cost related to your borrow and varies according to the mint market, borrow incentives and the crvUSD's peg.`,
}

export const MarketNetBorrowAprTooltipContent = ({
  marketType,
  borrowRate,
  totalBorrowRate,
  totalAverageBorrowRate,
  averageRate,
  periodLabel,
  extraRewards,
  rebasingYield,
  collateralSymbol,
  isLoading,
}: MarketBorrowRateTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription text={messages[marketType]} />

    {!!rebasingYield && (
      <TooltipDescription text={t`The collateral of this market is yield bearing and offers extra yield.`} />
    )}

    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={t`Borrow APR`}>{formatPercent(borrowRate ?? 0)}</TooltipItem>
        <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
          {averageRate ? formatPercent(averageRate) : 'N/A'}
        </TooltipItem>
      </TooltipItems>

      {extraRewards.length > 0 && (
        <TooltipItems secondary>
          <RewardsTooltipItems
            title={t`Borrowing incentives`}
            tooltipType={'borrow'}
            extraRewards={extraRewards}
            extraIncentives={[]}
          />
        </TooltipItems>
      )}

      {!!rebasingYield && (
        <TooltipItems secondary>
          <TooltipItem title={t`Yield bearing tokens`}>{formatPercent(-rebasingYield)}</TooltipItem>
          {!!collateralSymbol && (
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatPercent(-rebasingYield)}
            </TooltipItem>
          )}
        </TooltipItems>
      )}

      {totalBorrowRate != null && (
        <TooltipItems>
          <TooltipItem variant="primary" title={t`Net borrow APR`}>
            {formatPercent(totalBorrowRate)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {totalAverageBorrowRate ? formatPercent(totalAverageBorrowRate) : 'N/A'}
          </TooltipItem>
        </TooltipItems>
      )}
    </Stack>
  </TooltipWrapper>
)
