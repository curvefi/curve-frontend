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

export type MarketNetBorrowAprTooltipContentProps = {
  marketType: LlamaMarketType
  borrowApr: number | null | undefined
  averageApr: number | null | undefined
  totalBorrowApr: number | null | undefined
  totalAverageBorrowApr: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: CampaignPoolRewards[]
  rebasingYieldApr: number | null | undefined
  collateralSymbol: string | null | undefined
  isLoading?: boolean
}

const messages: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`The borrow rate is the cost related to your borrow and varies according to the monetary policy of the market.`,
  [LlamaMarketType.Mint]: t`The borrow rate is the cost related to your borrow and varies according to the market, borrow incentives and crvUSD's peg.`,
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
        <TooltipItem title={t`Borrow APR`}>{formatPercent(borrowApr ?? 0)}</TooltipItem>
        <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
          {averageApr == null ? 'N/A' : formatPercent(averageApr)}
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

      {rebasingYieldApr != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`Yield bearing tokens`}>{formatPercent(-rebasingYieldApr)}</TooltipItem>
          {!!collateralSymbol && (
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatPercent(-rebasingYieldApr)}
            </TooltipItem>
          )}
        </TooltipItems>
      )}

      {totalBorrowApr != null && (extraRewards.length || rebasingYieldApr != null) && (
        <TooltipItems>
          <TooltipItem variant="primary" title={t`Net borrow APR`}>
            {formatPercent(totalBorrowApr)}
          </TooltipItem>
          <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
            {totalAverageBorrowApr == null ? 'N/A' : formatPercent(totalAverageBorrowApr)}
          </TooltipItem>
        </TooltipItems>
      )}
    </Stack>
  </TooltipWrapper>
)
