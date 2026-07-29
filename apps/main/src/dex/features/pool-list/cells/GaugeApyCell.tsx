import { GaugeApyTooltipContent } from '@/dex/components/GaugeApyTooltipContent'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { formatCellValue, getGaugeApyRange } from './utils'

type GaugeApyRangeProps = NonNullable<ReturnType<typeof getGaugeApyRange>> & { cellValue?: boolean }

export const GaugeApyRange = ({ boostedApy, unboostedApy, cellValue = false }: GaugeApyRangeProps) => (
  <>
    {cellValue ? formatCellValue(unboostedApy, 'percent.rate') : formatNumber(unboostedApy, 'percent.rate')}
    {' → '}
    <span style={{ whiteSpace: 'nowrap' }}>
      {cellValue ? formatCellValue(boostedApy, 'percent.rate') : formatNumber(boostedApy, 'percent.rate')}
    </span>
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
    {range ? <GaugeApyRange {...range} cellValue /> : formatCellValue(null, 'percent.rate')}
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
  const range = pool.gauge?.isKilled ? null : getGaugeApyRange(pool)
  const content = <GaugeApyAmount range={range} typographyVariant={typographyVariant} />

  return (
    <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        title={t`Gauge APY`}
        body={range && <GaugeApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
        placement={tooltipPlacement}
      >
        {content}
      </WithWrapper>
    </Box>
  )
}

export const GaugeApyCell = ({ pool }: { pool: PoolRow }) => {
  const range = pool.gauge?.isKilled ? null : getGaugeApyRange(pool)
  const content = range ? (
    <TokenInfo
      address={MAINNET_CRV.address}
      blockchainId={MAINNET_CRV.chain}
      iconSize="mui-sm"
      iconPosition="right"
      iconAlignment="start"
      primary={
        <span data-testid="pool-gauge-apy-unboosted">{formatCellValue(range.unboostedApy, 'percent.rate')}</span>
      }
      secondary={<span data-testid="pool-gauge-apy-boosted">{formatCellValue(range.boostedApy, 'percent.rate')}</span>}
      boldPrimary
      sx={{ justifyContent: 'end' }}
    />
  ) : (
    <GaugeApyAmount range={range} typographyVariant="tableCellMBold" />
  )

  return (
    <Box data-testid="pool-gauge-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        clickable
        title={t`Gauge APY`}
        body={range && <GaugeApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
        placement="top"
      >
        <Box data-testid={range && 'pool-gauge-apy-tooltip-trigger'}>{content}</Box>
      </WithWrapper>
    </Box>
  )
}
