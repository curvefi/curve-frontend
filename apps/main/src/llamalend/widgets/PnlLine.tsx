import type { PositionPnl } from '@/llamalend/position-metrics/zap-debt-share.utils'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { t } from '@ui/lib/i18n'

const signed = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, { abbreviate: true })}`

const pnlText = (pnl: number, symbol: string, percent: Decimal | undefined) =>
  `${signed(pnl)} ${symbol}${percent == undefined ? '' : ` (${signed(Number(percent))}%)`}`

/** PNL (ROE %) in the collateral token, like Summer.fi, DeFi Saver and Kamino, with the debt-token value on hover. */
export const PnlLine = ({
  pnl,
  collateralSymbol,
  borrowSymbol,
  variant = 'bodySRegular',
  testId,
}: {
  pnl: PositionPnl
  collateralSymbol: string
  borrowSymbol: string
  variant?: TypographyProps['variant']
  testId?: string
}) => {
  if (pnl.pnlCollateral == undefined) return null
  const value = Number(pnl.pnlCollateral)
  return (
    <Tooltip
      title={t`PNL (ROE %)`}
      body={
        <Typography variant="bodySRegular" data-testid={testId && `${testId}-debt`}>
          {t`In ${borrowSymbol}:`} {pnlText(Number(pnl.pnl), borrowSymbol, pnl.percent)}
        </Typography>
      }
      placement="top"
    >
      <Typography
        variant={variant}
        color={value > 0 ? 'success' : value < 0 ? 'error' : 'textSecondary'}
        data-testid={testId}
      >
        {pnlText(value, collateralSymbol, pnl.percentCollateral)}
      </Typography>
    </Tooltip>
  )
}
