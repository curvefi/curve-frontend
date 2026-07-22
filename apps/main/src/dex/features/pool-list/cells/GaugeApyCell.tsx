import { ChipInactive } from '@/dex/components/ChipInactive'
import { GaugeApyTooltipContent } from '@/dex/components/GaugeApyTooltipContent'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { getGaugeApyDescription, getGaugeApyRange } from './utils'

export const GaugeApyRange = ({ boostedApy, unboostedApy }: NonNullable<ReturnType<typeof getGaugeApyRange>>) => (
  <>
    {formatNumber(unboostedApy || null, 'percent.rate')}
    {' → '}
    <span style={{ whiteSpace: 'nowrap' }}>{formatNumber(boostedApy || null, 'percent.rate')}</span>
  </>
)

const GaugeApyAmount = ({
  range,
  typographyVariant,
}: {
  range: ReturnType<typeof getGaugeApyRange>
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {range ? <GaugeApyRange {...range} /> : formatNumber(null, 'percent.rate')}
  </Typography>
)

export const GaugeApyValue = ({
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
      <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
        <ChipInactive>{t`Inactive gauge`}</ChipInactive>
      </Box>
    )
  }

  const range = getGaugeApyRange(pool)
  const content = <GaugeApyAmount range={range} typographyVariant={typographyVariant} />

  return (
    <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
      {range ? (
        <Tooltip title={getGaugeApyDescription()} placement={tooltipPlacement}>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  )
}

export const GaugeApyCell = ({ pool }: { pool: PoolRow }) => {
  if (pool.gauge?.isKilled) {
    return (
      <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
        <ChipInactive>{t`Inactive gauge`}</ChipInactive>
      </Box>
    )
  }

  const range = getGaugeApyRange(pool)
  const content = range ? (
    <TokenInfo
      address={MAINNET_CRV.address}
      blockchainId={MAINNET_CRV.chain}
      iconSize="mui-sm"
      iconPosition="right"
      iconAlignment="start"
      primary={<span data-testid="pool-gauge-apy-unboosted">{formatNumber(range.unboostedApy, 'percent.rate')}</span>}
      secondary={<span data-testid="pool-gauge-apy-boosted">{formatNumber(range.boostedApy, 'percent.rate')}</span>}
      boldPrimary
      sx={{ justifyContent: 'end' }}
    />
  ) : (
    <GaugeApyAmount range={range} typographyVariant="tableCellMBold" />
  )

  return (
    <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
      {range ? (
        <Tooltip
          clickable
          title={t`Gauge APY`}
          body={<GaugeApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
          placement="top"
        >
          <Box data-testid="pool-gauge-apy-tooltip-trigger">{content}</Box>
        </Tooltip>
      ) : (
        content
      )}
    </Box>
  )
}
