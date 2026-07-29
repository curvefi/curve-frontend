import { CrvApyTooltipContent } from '@/dex/components/CrvApyTooltipContent'
import Box from '@mui/material/Box'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TokenInfo } from '@ui-kit/shared/ui/TokenInfo'
import { Tooltip, type TooltipProps } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { formatNumber, MAINNET_CRV } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { formatCellValue, getCrvApyRange } from './utils'

type CrvApyRangeProps = NonNullable<ReturnType<typeof getCrvApyRange>> & { cellValue?: boolean }

export const CrvApyRange = ({ boostedApy, unboostedApy, cellValue = false }: CrvApyRangeProps) => (
  <>
    {cellValue ? formatCellValue(unboostedApy, 'percent.rate') : formatNumber(unboostedApy, 'percent.rate')}
    {' → '}
    <span style={{ whiteSpace: 'nowrap' }}>
      {cellValue ? formatCellValue(boostedApy, 'percent.rate') : formatNumber(boostedApy, 'percent.rate')}
    </span>
  </>
)

const CrvApyAmount = ({
  range,
  typographyVariant,
}: {
  range: ReturnType<typeof getCrvApyRange>
  typographyVariant: TypographyProps['variant']
}) => (
  <Typography component="span" variant={typographyVariant}>
    {range ? <CrvApyRange {...range} cellValue /> : formatCellValue(null, 'percent.rate')}
  </Typography>
)

export const CrvApyValue = ({
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
  const range = pool.gauge?.isKilled ? null : getCrvApyRange(pool)
  const content = <CrvApyAmount range={range} typographyVariant={typographyVariant} />

  return (
    <Box data-testid="pool-crv-apy" sx={{ display: 'flex', justifyContent: textAlign }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        title={t`CRV APY`}
        body={range && <CrvApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
        placement={tooltipPlacement}
      >
        {content}
      </WithWrapper>
    </Box>
  )
}

export const CrvApyCell = ({ pool }: { pool: PoolRow }) => {
  const range = pool.gauge?.isKilled ? null : getCrvApyRange(pool)
  const content = range ? (
    <TokenInfo
      address={MAINNET_CRV.address}
      blockchainId={MAINNET_CRV.chain}
      iconSize="mui-sm"
      iconPosition="right"
      iconAlignment="start"
      primary={
        <span data-testid="pool-crv-apy-unboosted">{formatCellValue(range.unboostedApy, 'percent.rate')}</span>
      }
      secondary={<span data-testid="pool-crv-apy-boosted">{formatCellValue(range.boostedApy, 'percent.rate')}</span>}
      boldPrimary
      sx={{ justifyContent: 'end' }}
    />
  ) : (
    <CrvApyAmount range={range} typographyVariant="tableCellMBold" />
  )

  return (
    <Box data-testid="pool-crv-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        clickable
        title={t`CRV APY`}
        body={range && <CrvApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
        placement="top"
      >
        <Box data-testid={range && 'pool-crv-apy-tooltip-trigger'}>{content}</Box>
      </WithWrapper>
    </Box>
  )
}
