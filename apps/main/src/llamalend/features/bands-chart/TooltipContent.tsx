import { t } from '@evm-ui/lib/i18n'
import { formatChartAxisNumber } from '@evm-ui/shared/ui/Chart'
import { LegendBox } from '@evm-ui/shared/ui/Chart/LegendSet'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { decimalGreaterThan, decimalPercent, formatNumber, formatToken, ZERO } from '@evm-ui/utils'
import { Box, Stack, Typography } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import type { BandsChartToken, ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

type TooltipContentProps = {
  data: ChartDataPoint
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
}

const isPositiveDecimal = (value: Decimal | undefined): boolean => value != null && decimalGreaterThan(value, ZERO)
const calculateBandShare = (part: Decimal | undefined, total: Decimal | undefined) =>
  formatNumber(
    maybes([part, total], (part, total) => decimalPercent(part, total)),
    'percent.rate',
  )

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const palette = useBandsChartPalette()
  const hasMarketData = isPositiveDecimal(data.bandTotalValue)
  const hasUserData = isPositiveDecimal(data.userBandTotalValue)

  return (
    <Box sx={{ padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }} onClick={e => e.stopPropagation()}>
      <TooltipWrapper>
        <Typography variant="bodyMBold" color="textPrimary">
          {t`LLAMMA Band ${data.n}`}
        </Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          {t`Active price range where collateral and debt rebalance.`}
        </Typography>
        {hasUserData && (
          <Stack sx={{ gap: Spacing.sm, marginBottom: Spacing.sm }}>
            <TooltipItems secondary>
              <TooltipItem title={t`Your share of band`} sx={{ marginBottom: Spacing.sm }}>
                {calculateBandShare(data.userBandTotalValue, data.bandTotalValue)}
              </TooltipItem>
              <TooltipItem
                title={t`Your position balances`}
              >{`${calculateBandShare(data.userBandCollateralValue, data.userBandTotalValue)} / ${calculateBandShare(data.userBandBorrowedAmount, data.userBandTotalValue)}`}</TooltipItem>
              <TooltipItem
                variant="subItem"
                title={collateralToken?.symbol}
                titleAdornment={<LegendBox outline="none" fill={palette.userCollateralShareColor} />}
              >
                {formatNumber(data.userBandCollateralAmount, 'token.amount')}
              </TooltipItem>
              <TooltipItem
                variant="subItem"
                title={borrowToken?.symbol}
                titleAdornment={<LegendBox outline="none" fill={palette.userBorrowedShareColor} />}
              >
                {formatNumber(data.userBandBorrowedAmount, 'token.amount')}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Your band liquidity`}>
              {formatToken(data.userBandTotalValue, borrowToken?.symbol)}
            </TooltipItem>
          </Stack>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`}>
                {maybes([collateralToken?.symbol, borrowToken?.symbol], (x, y) => `${x} / ${y}`)}
              </TooltipItem>
              <TooltipItem variant="subItem" title={t`Min`}>
                {formatChartAxisNumber(data.p_down, { abbreviateFrom: false })}
              </TooltipItem>
              <TooltipItem variant="subItem" title={t`Max`}>
                {formatChartAxisNumber(data.p_up, { abbreviateFrom: false })}
              </TooltipItem>
              <TooltipItem title={t`Band balances`} sx={{ marginTop: Spacing.sm }}>
                {`${calculateBandShare(data.bandCollateralValue, data.bandTotalValue)} / ${calculateBandShare(data.bandBorrowedAmount, data.bandTotalValue)}`}
              </TooltipItem>
              <TooltipItem variant="subItem" title={collateralToken?.symbol}>
                {formatNumber(data.bandCollateralAmount, 'token.amount')}
              </TooltipItem>
              <TooltipItem variant="subItem" title={borrowToken?.symbol}>
                {formatNumber(data.bandBorrowedAmount, 'token.amount')}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Band liquidity`}>
              {formatToken(data.bandTotalValue, borrowToken?.symbol)}
            </TooltipItem>
          </>
        )}
      </TooltipWrapper>
    </Box>
  )
}
