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
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { GaugeApyTooltipItems, RewardsApyTooltipItems } from './ApyTooltipItems'
import { RewardIcons } from './RewardIcons'
import { aprToPoolApy, getNetApy } from './utils'

const { Spacing } = SizesAndSpaces

const TooltipFreeVolatileNetApyChip = styled(Chip)`
  color: var(--danger-400);
`

const formatApy = (apy: number | null | undefined) => formatNumber(apy || null, 'percent.rate')
const VOLATILE_NET_APY_LABEL = `${formatNumber(5000, { abbreviate: false })}+%`

const isVolatileBaseApy = (pool: PoolRow) => {
  const baseApy = aprToPoolApy(pool.baseDailyApr)
  return baseApy != null && baseApy > LARGE_APY
}

const NetApyTooltipContent = ({ pool, volatile }: { pool: PoolRow; volatile: boolean }) => {
  const baseApy = aprToPoolApy(pool.baseDailyApr)
  const unboostedGaugeApy = pool.gauge?.isKilled ? null : aprToPoolApy(pool.crvApr)
  const hasUnboostedGaugeApy = unboostedGaugeApy != null && unboostedGaugeApy !== 0
  const netApy = getNetApy(pool)

  return (
    <Box data-testid="pool-net-apy-tooltip-content">
      <TooltipWrapper>
        <TooltipDescription
          text={t`Estimated net annualized yield from Base APY, unboosted CRV gauge APY, and Rewards APY.`}
        />
        <Stack>
          <TooltipItems secondary>
            <TooltipItem title={t`Base APY`}>{formatApy(baseApy)}</TooltipItem>
          </TooltipItems>
          <RewardsApyTooltipItems pool={pool} showTotal={false} />
          {hasUnboostedGaugeApy && <GaugeApyTooltipItems unboostedApy={unboostedGaugeApy} showMaximum={false} />}
          <TooltipItems borderTop>
            <TooltipItem variant="primary" title={t`Net APY`}>
              {formatApy(netApy)}
            </TooltipItem>
          </TooltipItems>
        </Stack>
        {volatile && <TooltipDescription text={t`This net APY is volatile and is unlikely to persist.`} />}
        <TooltipFooter>{t`Points are not included in Net APY.`}</TooltipFooter>
      </TooltipWrapper>
    </Box>
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
      {formatNumber(netApy === 0 ? null : netApy, 'percent.rate')}
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
      {formatApy(netApy)}
    </Typography>
  )

  return (
    <Stack data-testid="pool-net-apy-cell" sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
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
      <RewardIcons pool={pool} includeCrv />
    </Stack>
  )
}
