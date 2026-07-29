import { styled } from 'styled-components'
import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { Chip } from '@ui/Typography/Chip'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui-kit/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AVERAGE_CATEGORIES, formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { CampaignRewardTooltipItems, ExtraRewardTooltipItems, PointsTooltipItems } from './ApyTooltipItems'
import { RewardIcons } from './RewardIcons'
import {
  aprToPoolApy,
  getAprCampaigns,
  getExtraRewards,
  formatCellValue,
  getGaugeApyRange,
  getNetApy,
  getRewardsApy,
  isPointsCampaign,
} from './utils'

const { Spacing } = SizesAndSpaces

const TooltipFreeVolatileNetApyChip = styled(Chip)`
  color: var(--danger-400);
`

const VOLATILE_NET_APY_LABEL = `${formatNumber(5000, { abbreviate: false })}+%`

const isVolatileBaseApy = (pool: PoolRow) => {
  const baseApy = aprToPoolApy(pool.baseDailyApr)
  return baseApy != null && baseApy > LARGE_APY
}

const getIncentivesItems = (pool: PoolRow) => {
  const extraRewards = getExtraRewards(pool)
  const campaigns = getAprCampaigns(pool)
  const pointsCampaigns = pool.campaigns.filter(isPointsCampaign)
  const unboostedGaugeApy = pool.gauge?.isKilled ? null : aprToPoolApy(pool.crvApr)
  const hasGaugeApy = unboostedGaugeApy != null && unboostedGaugeApy !== 0

  if (!hasGaugeApy && !extraRewards.length && !campaigns.length && !pointsCampaigns.length) return null
  else
    return {
      incentivesApy: getRewardsApy(pool) + (hasGaugeApy ? unboostedGaugeApy : 0),
      extraRewards,
      campaigns,
      pointsCampaigns,
      unboostedGaugeApy,
    }
}

export const NetApyIncentivesTooltipItems = ({
  items: { incentivesApy, extraRewards, campaigns, pointsCampaigns, unboostedGaugeApy },
  network,
}: {
  items: NonNullable<ReturnType<typeof getIncentivesItems>>
  network: string
}) => (
  <TooltipItems secondary>
    <TooltipItem title={t`Incentives`}>{formatNumber(incentivesApy, 'percent.rate')}</TooltipItem>
    {!!unboostedGaugeApy && (
      <TooltipItem
        variant="subItem"
        title="CRV"
        titleIcon={{ blockchainId: MAINNET_CRV.chain, address: MAINNET_CRV.address, size: 'mui-sm' }}
      >
        {formatNumber(unboostedGaugeApy, 'percent.rate')}
      </TooltipItem>
    )}
    <ExtraRewardTooltipItems network={network} rewards={extraRewards} />
    <CampaignRewardTooltipItems campaigns={campaigns} />
    <PointsTooltipItems campaigns={pointsCampaigns} />
  </TooltipItems>
)

const NetApyTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const baseApy = aprToPoolApy(pool.baseDailyApr)
  const netApy = getNetApy(pool)
  const gaugeApyRange = pool.gauge && !pool.gauge.isKilled ? getGaugeApyRange(pool) : null
  const maxNetApy = gaugeApyRange ? netApy - gaugeApyRange.unboostedApy + gaugeApyRange.boostedApy : null
  const incentiveItems = getIncentivesItems(pool)

  return (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated net annualized yield from Base APY, unboosted CRV gauge APY, and various reward APYs.`}
      />
      <Stack>
        <TooltipItems secondary>
          <TooltipItem title={t`Base APY`}>{formatNumber(baseApy, 'percent.rate')}</TooltipItem>
        </TooltipItems>
        {incentiveItems && <NetApyIncentivesTooltipItems items={incentiveItems} network={pool.network} />}
        <TooltipItems borderTop>
          <TooltipItem variant="primary" title={t`Total APY`}>
            {formatNumber(netApy, 'percent.rate')}
          </TooltipItem>
        </TooltipItems>
        {gaugeApyRange && (
          <>
            <TooltipItems secondary extraMargin>
              <TooltipItem title={t`Max veCRV Boost (2.5x)`}>
                {formatNumber(gaugeApyRange.boostedApy, 'percent.rate')}
              </TooltipItem>
            </TooltipItems>
            <TooltipItems borderTop>
              <TooltipItem variant="primary" title={t`Total max veCRV APY`}>
                {formatNumber(maxNetApy, 'percent.rate')}
              </TooltipItem>
            </TooltipItems>
          </>
        )}
      </Stack>
      {volatile && <TooltipDescription text={t`This net APY is volatile and is unlikely to persist.`} />}
      {incentiveItems && (
        <TooltipFooter>
          {t`*Token incentive and yield bearing APY assume a ${AVERAGE_CATEGORIES['dex.poolYield.compoundRate'].adjective} compounding rate.`}
        </TooltipFooter>
      )}
    </TooltipWrapper>
  )
}

export const NetApyValue = ({
  pool,
  textAlign = 'end',
  typographyVariant = 'tableCellMBold',
}: {
  pool: PoolRow
  textAlign?: 'start' | 'end'
  typographyVariant?: TypographyProps['variant']
}) => {
  const netApy = getNetApy(pool)
  const baseApy = aprToPoolApy(pool.baseDailyApr)

  return baseApy != null && baseApy > LARGE_APY ? (
    <Box data-testid="pool-net-apy" sx={{ textAlign }}>
      <ChipVolatileBaseApy isBold />
    </Box>
  ) : (
    <Typography data-testid="pool-net-apy" variant={typographyVariant} sx={{ display: 'block', textAlign }}>
      {formatCellValue(netApy, 'percent.rate')}
    </Typography>
  )
}

export const NetApyCell = ({ pool }: { pool: PoolRow }) => <NetApyCellContent pool={pool} />

const NetApyCellContent = ({ pool }: { pool: PoolRow }) => {
  const netApy = getNetApy(pool)
  const volatile = isVolatileBaseApy(pool)
  const value = volatile ? (
    <Box component="span" data-testid="pool-net-apy" sx={{ textAlign: 'end' }}>
      <TooltipFreeVolatileNetApyChip size="md" isBold>
        {VOLATILE_NET_APY_LABEL}
      </TooltipFreeVolatileNetApyChip>
    </Box>
  ) : (
    <Typography
      component="span"
      data-testid="pool-net-apy"
      variant="tableCellMBold"
      sx={{ display: 'block', textAlign: 'end' }}
    >
      {formatCellValue(netApy, 'percent.rate')}
    </Typography>
  )

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      {netApy ? (
        <Tooltip
          clickable
          title={t`Net APY`}
          body={<NetApyTooltipContent pool={pool} volatile={volatile} />}
          placement="top"
        >
          <Box component="span" data-testid="pool-net-apy-tooltip-trigger" sx={{ display: 'inline-flex' }}>
            {value}
          </Box>
        </Tooltip>
      ) : (
        value
      )}
      <RewardIcons pool={pool} includeCrv includePoints />
    </Stack>
  )
}
