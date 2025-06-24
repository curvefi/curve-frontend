import type { ReactNode } from 'react'
import { getRewardsDescription } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/cell.utils'
import { LlamaMarket, LlamaMarketType } from '@/loan/entities/llama-markets'
import Button from '@mui/material/Button'
import MuiLink from '@mui/material/Link'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RateType, useSnapshots } from '../hooks/useSnapshots'
import { formatPercent, getRewardsAction } from './cell.format'

const { Spacing } = SizesAndSpaces

const rateName = {
  borrow: t`Borrow APY`,
  lend: t`Supply APR`,
}

const paragraphs = {
  [LlamaMarketType.Lend]: t`Lending markets let users earn by lending assets or borrow using collateral.`,
  [LlamaMarketType.Mint]: t`Mint markets lets users borrow by minting crvUSD against collateral.`,
}

const learnMoreLinks = {
  [LlamaMarketType.Lend]: 'https://resources.curve.finance/lending/overview/#utilization-lend-apy-and-borrow-apy',
  [LlamaMarketType.Mint]: 'https://resources.curve.finance/crvusd/loan-concepts/#borrow-rate',
}

const Item = ({
  icon,
  title,
  children,
  loading = false,
}: {
  icon?: ReactNode
  title: ReactNode
  children: string
  loading?: boolean
}) => (
  <Typography component={Stack} color="textSecondary" direction="row" justifyContent="space-between">
    <Stack direction="row" flexShrink={1} gap={1}>
      {icon}
      {title}
    </Stack>
    <WithSkeleton loading={loading}>
      <Typography variant="bodyMRegular">{children}</Typography>
    </WithSkeleton>
  </Typography>
)

export const RateTooltipContent = ({ type, market }: { type: RateType; market: LlamaMarket }) => {
  const { rate, averageRate, period } = useSnapshots(market, type)
  const { rewards, rates, type: marketType } = market
  const { lendCrvAprBoosted, lendCrvAprUnboosted } = rates
  const rewardsAction = getRewardsAction(marketType, 'borrow')
  const poolRewards = rewards.filter((r) => r.action === rewardsAction)
  return (
    <>
      <Stack gap={2}>
        <Typography color="textSecondary">{paragraphs[marketType]}</Typography>
      </Stack>
      <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm} marginBlock={Spacing.sm}>
        <Typography variant="bodyMBold" color="textPrimary">{t`Rates Breakdown`}</Typography>
        <Item loading={averageRate == null} title={`${period} ${rateName[type]}`}>
          {formatPercent(averageRate)}
        </Item>
        <Item loading={rate == null} title={`${t`Current`} ${rateName[type]}`}>
          {formatPercent(rate)}
        </Item>
        {type === 'lend' && (
          <>
            {lendCrvAprUnboosted != null && lendCrvAprUnboosted && (
              <Item title={t`CRV APR (unboosted)`}>{formatPercent(lendCrvAprUnboosted)}</Item>
            )}
            {lendCrvAprBoosted != null && lendCrvAprBoosted && (
              <Item title={t`CRV APR (max boosted)`}>{formatPercent(lendCrvAprBoosted)}</Item>
            )}
          </>
        )}
        {poolRewards.map((r, i) => (
          <Item
            key={i}
            title={
              <Stack>
                {getRewardsDescription(r)}
                {r.dashboardLink && <Link href={r.dashboardLink} target="_blank">{t`Go to issuer`}</Link>}
              </Stack>
            }
            icon={<RewardIcon size="md" imageId={r.platformImageId} />}
          >
            {r.multiplier}
          </Item>
        ))}
      </Stack>
      <Button component={MuiLink} href={learnMoreLinks[market.type]} color="ghost" target="_blank">
        {t`Learn More`}
        <ArrowTopRightIcon />
      </Button>
    </>
  )
}
