import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { PoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TooltipItem, TooltipItems, TooltipWrapper, TooltipDescription } from '@ui-kit/shared/ui/TooltipComponents'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketType } from '@ui-kit/types/market'

const { Spacing } = SizesAndSpaces

// Local percent formatter to mirror app behavior (accepts values like 3.5 -> "3.50%")
const formatPercent = (rate: number | null | undefined) =>
  `${((rate ?? 0) as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

export type ExtraIncentiveItem = {
  title: string
  percentage: number
  address: string
  blockchainId: string
}

type RewardsTooltipItemsProps = {
  title: string
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentiveItem[]
}

const RewardsTooltipItems = ({ title, extraRewards, extraIncentives }: RewardsTooltipItemsProps) => {
  const totalExtraPercentage =
    extraIncentives.length > 0
      ? formatPercent(extraIncentives.reduce((sum, item) => sum + (item.percentage || 0), 0))
      : undefined

  return (
    <>
      <TooltipItem title={title}>{totalExtraPercentage}</TooltipItem>
      {extraIncentives.map(({ percentage, title, address, blockchainId }, i) => (
        <TooltipItem key={i} variant="subItem" title={title}>
          <Stack direction="row" gap={Spacing.xs} alignItems="center">
            <TokenIcon blockchainId={blockchainId} address={address} size="mui-sm" />
            {formatPercent(percentage)}
          </Stack>
        </TooltipItem>
      ))}
      {extraRewards.map((r, i) => (
        <TooltipItem variant="subItem" key={i} title={t`Points`}>
          <Stack
            component={Link}
            href={r.dashboardLink}
            target="_blank"
            sx={{
              textDecoration: 'none',
              color: (t) => t.design.Text.TextColors.Secondary,
              svg: { fontSize: 0, transition: `font-size ${TransitionFunction}` },
              '&:hover svg': { fontSize: 20 },
            }}
            direction="row"
            alignItems="center"
            gap={Spacing.xs}
          >
            <RewardIcon size="md" imageId={r.platformImageId} />
            {r.multiplier}
            <ArrowOutwardIcon />
          </Stack>
        </TooltipItem>
      ))}
    </>
  )
}

export type MarketBorrowRateTooltipProps = {
  marketType: MarketType
  borrowRate: number | null | undefined
  borrowTotalApy: number | null | undefined
  averageRate: number | null | undefined
  periodLabel: string // e.g. "7D", "30D"
  extraRewards: PoolRewards[]
  extraIncentives: ExtraIncentiveItem[]
  rebasingYield?: number | null | undefined
  collateralSymbol?: string | null | undefined
  isLoading?: boolean
}

const messages: Record<MarketType, string> = {
  lend: t`The borrow rate is the cost related to your borrow and varies according to the lend market, borrow incentives and its utilization.`,
  mint: t`The borrow rate is the cost related to your borrow and varies according to the mint market, borrow incentives and the crvUSD's peg.`,
}

export const MarketBorrowRateTooltip = ({
  marketType,
  borrowRate,
  borrowTotalApy,
  averageRate,
  periodLabel,
  extraRewards,
  extraIncentives,
  rebasingYield,
  collateralSymbol,
  isLoading,
}: MarketBorrowRateTooltipProps) => (
  <TooltipWrapper>
    <TooltipDescription text={messages[marketType]} />

    {!!rebasingYield && (
      <TooltipDescription text={t`The collateral of this market is yield bearing and offers extra yield`} />
    )}

    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={t`Borrow rate`}>{formatPercent(borrowRate ?? 0)}</TooltipItem>
      </TooltipItems>

      {(extraRewards.length > 0 || extraIncentives.length > 0) && (
        <TooltipItems secondary>
          <RewardsTooltipItems
            title={t`Borrowing incentives`}
            extraRewards={extraRewards}
            extraIncentives={extraIncentives}
          />
        </TooltipItems>
      )}

      {!!rebasingYield && (
        <TooltipItems secondary>
          <TooltipItem title={t`Yield bearing tokens`}>{formatPercent(rebasingYield)}</TooltipItem>
          {!!collateralSymbol && (
            <TooltipItem variant="subItem" title={collateralSymbol}>
              {formatPercent(rebasingYield)}
            </TooltipItem>
          )}
        </TooltipItems>
      )}

      <TooltipItems>
        <TooltipItem variant="primary" title={t`Total borrow rate`}>
          {formatPercent(borrowTotalApy ?? 0)}
        </TooltipItem>
        <TooltipItem variant="subItem" loading={isLoading} title={`${periodLabel} ${t`Average`}`}>
          {averageRate ? formatPercent(averageRate) : 'N/A'}
        </TooltipItem>
      </TooltipItems>
    </Stack>
  </TooltipWrapper>
)
