import { ChipInactive } from '@/dex/components/ChipInactive'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { TooltipDescription, TooltipWrapper } from '@ui-kit/shared/ui/TooltipComponents'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { GaugeApyTooltipItems } from './ApyTooltipItems'
import { getBoostApyDescription, getBoostApyRange } from './utils'

export const BoostApyRange = ({ boostedApy, unboostedApy }: NonNullable<ReturnType<typeof getBoostApyRange>>) => (
  <>
    {formatNumber(unboostedApy || null, 'percent.rate')}
    {' → '}
    <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(boostedApy || null, 'percent.rate')}</span>
  </>
)

const BoostApyAmount = ({
  range,
  typographyVariant,
}: {
  range: ReturnType<typeof getBoostApyRange>
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {range ? <BoostApyRange {...range} /> : formatNumber(null, 'percent.rate')}
  </Typography>
)

const BoostApyTooltipContent = ({ range }: { range: NonNullable<ReturnType<typeof getBoostApyRange>> }) => (
  <Box data-testid="pool-boost-apy-tooltip-content">
    <TooltipWrapper>
      <TooltipDescription text={t`CRV gauge reward APY ranges from the unboosted rate to the maximum boosted rate.`} />
      <TooltipDescription text={t`The maximum rate assumes the full 2.5x gauge boost.`} />
      <GaugeApyTooltipItems unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />
    </TooltipWrapper>
  </Box>
)

export const BoostApyValue = ({
  pool,
  textAlign = 'end',
  tooltipPlacement = 'bottom-end',
  typographyVariant = 'tableCellMBold',
}: {
  pool: PoolRow
  textAlign?: 'start' | 'end'
  tooltipPlacement?: TooltipProps['placement']
  typographyVariant?: TypographyProps['variant']
}) => {
  if (pool.gauge?.isKilled) {
    return (
      <Box data-testid="pool-boost-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
        <ChipInactive>{t`Inactive gauge`}</ChipInactive>
      </Box>
    )
  }

  const range = getBoostApyRange(pool)
  const content = <BoostApyAmount range={range} typographyVariant={typographyVariant} />

  return (
    <Box data-testid="pool-boost-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
      {range ? (
        <Tooltip title={getBoostApyDescription()} placement={tooltipPlacement}>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  )
}

export const BoostApyCell = ({ pool }: { pool: PoolRow }) => {
  if (pool.gauge?.isKilled) {
    return (
      <Box data-testid="pool-boost-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
        <ChipInactive>{t`Inactive gauge`}</ChipInactive>
      </Box>
    )
  }

  const range = getBoostApyRange(pool)
  const content = <BoostApyAmount range={range} typographyVariant="tableCellMBold" />

  return (
    <Box data-testid="pool-boost-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
      {range ? (
        <Tooltip clickable title={t`Boost APY`} body={<BoostApyTooltipContent range={range} />} placement="top">
          <Box component="span" data-testid="pool-boost-apy-tooltip-trigger" sx={{ display: 'inline-flex' }}>
            {content}
          </Box>
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  )
}
