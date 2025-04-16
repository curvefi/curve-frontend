import type { ReactNode } from 'react'
import type { PoolRewards } from '@/loan/entities/campaigns'
import { LlamaMarketType } from '@/loan/entities/llama-markets'
import Button from '@mui/material/Button'
import MuiLink from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { RewardIcon } from '@ui-kit/shared/ui/RewardIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RateType } from '../hooks/useSnapshots'
import { formatPercent } from './cell.format'
import { getRewardsDescription } from './MarketTitleCell/cell.utils'

const { Spacing } = SizesAndSpaces

const rateName = {
  borrow: t`Borrow Rate`,
  lend: t`Lending Rate`,
}

const paragraphs = {
  borrow: [
    t`The borrow APR is the cost related to your borrow and varies according to the market and crvUSD's peg.`,
    t`The collateral of this market is yield bearing and offer extra yield.`,
  ],
  lend: [
    t`The supply APR is the yield offered by the market and depends on the monetary policy of the market.`,
    t`The lent asset of this market offers extra points.`,
  ],
}

const learnMoreLinks = {
  [LlamaMarketType.Lend]: 'https://resources.curve.fi/lending/overview/#utilization-lend-apy-and-borrow-apy',
  [LlamaMarketType.Mint]: 'https://resources.curve.fi/crvusd/loan-concepts/#borrow-rate',
}

const Item = ({ icon, title, children }: { icon?: ReactNode; title: string; children: string }) => (
  <Typography component={Stack} color="textSecondary" direction="row" justifyContent="space-between">
    <Stack direction="row" flexShrink={1} gap={1}>
      {icon}
      {title}
    </Stack>
    {children}
  </Typography>
)

export const RateTooltipContent = ({
  type,
  averageRate,
  rate,
  rewards,
  period,
  marketType,
}: {
  type: RateType
  rate: number | null
  averageRate: number | null
  rewards: PoolRewards[]
  period: string
  marketType: LlamaMarketType
}) => (
  <>
    <Stack gap={2}>
      {paragraphs[type].map((p) => (
        <Typography color="textSecondary" key={p}>
          {p}
        </Typography>
      ))}
    </Stack>
    <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm} marginBlock={Spacing.sm}>
      <Typography variant="bodyMBold" color="textPrimary">{t`Rates Breakdown`}</Typography>
      {averageRate != null && <Item title={`${period} ${rateName[type]}`}>{formatPercent(averageRate)}</Item>}
      {rate != null && <Item title={`${t`Current`} ${rateName[type]}`}>{formatPercent(rate)}</Item>}
      {rewards.map((r, i) => (
        <Item key={i} title={getRewardsDescription(r)} icon={<RewardIcon size="md" imageId={r.platformImageId} />}>
          {r.multiplier}
        </Item>
      ))}
    </Stack>
    <Button component={MuiLink} href={learnMoreLinks[marketType]} color="ghost" target="_blank">
      {t`Learn More`}
      <ArrowTopRightIcon />
    </Button>
  </>
)
