import type { ReactNode } from 'react'
import { formatPercent } from '@/loan/components/PageLlamaMarkets/cells/cell.format'
import { RateType } from '@/loan/components/PageLlamaMarkets/hooks/useSnapshots'
import type { PoolRewards } from '@/loan/entities/campaigns'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TooltipContent } from '@ui-kit/shared/ui/TooltipContent'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getRewardsDescription } from './MarketTitleCell/cell.utils'

const { Spacing } = SizesAndSpaces

const titles = {
  borrow: t`Borrow APR`,
  lend: t`Supply APR`,
}

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

const Item = ({ icon, title, children }: { icon?: ReactNode; title: string; children: string }) => (
  <Stack direction="row" justifyContent="space-between">
    <Stack direction="row" flexShrink={1}>
      {icon}
      {title}
    </Stack>
    {children}
  </Stack>
)

export const RateTooltipContent = ({
  type,
  averageRate,
  rate,
  rewards,
  period,
}: {
  type: RateType
  rate: number | null
  averageRate: number | null
  rewards: PoolRewards[]
  period: string
}) => (
  <TooltipContent title={titles[type]}>
    <Stack gap={1}>
      {paragraphs[type].map((p) => (
        <Typography color="textSecondary" key={p}>
          {p}
        </Typography>
      ))}
    </Stack>
    <Stack bgcolor={(t) => t.design.Layer[2].Fill} padding={Spacing.sm}>
      <Typography variant="bodyMBold">{t`Rates Breakdown`}</Typography>
      {averageRate != null && <Item title={`${period} ${rateName[type]}`}>{formatPercent(averageRate)}</Item>}
      {rate != null && <Item title={`${t`Current`} ${rateName[type]}`}>{formatPercent(rate)}</Item>}
      {rewards.map((r, i) => (
        <Item key={i} title={getRewardsDescription(r)}>
          {r.multiplier}
        </Item>
      ))}
    </Stack>
  </TooltipContent>
)
