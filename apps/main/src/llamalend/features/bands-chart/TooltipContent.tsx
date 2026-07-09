import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Stack, Typography } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { formatChartAxisNumber } from '@ui-kit/shared/ui/Chart'
import { LegendBox } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimalGreaterThan, decimalPercent, formatNumber, ZERO } from '@ui-kit/utils'
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

const formatAbbreviatedNumber = (value: Decimal | undefined): string =>
  formatNumber(value, { abbreviate: true, fallback: '?' })

const formatBorrowTokenValue = (value: Decimal | undefined, borrowTokenSymbol: string | undefined): string =>
  formatNumber(value, {
    abbreviate: true,
    fallback: '?',
    unit: { symbol: borrowTokenSymbol ? ` ${borrowTokenSymbol}` : '', position: 'suffix' },
  })

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const palette = useBandsChartPalette()
  const hasMarketData = isPositiveDecimal(data.bandTotalValue)
  const hasUserData = isPositiveDecimal(data.userBandTotalValue)
  const borrowTokenSuffix = borrowToken?.symbol ? ` ${borrowToken.symbol}` : ''
  const bandRange = `${formatChartAxisNumber(data.p_down, { abbreviateFrom: false })} - ${formatChartAxisNumber(data.p_up, { abbreviateFrom: false })}${borrowTokenSuffix}`

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
                {formatAbbreviatedNumber(data.userBandCollateralAmount)}
              </TooltipItem>
              <TooltipItem
                variant="subItem"
                title={borrowToken?.symbol}
                titleAdornment={<LegendBox outline="none" fill={palette.userBorrowedShareColor} />}
              >
                {formatAbbreviatedNumber(data.userBandBorrowedAmount)}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Your band liquidity`}>
              {formatBorrowTokenValue(data.userBandTotalValue, borrowToken?.symbol)}
            </TooltipItem>
          </Stack>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`} sx={{ marginBottom: Spacing.sm }}>
                {bandRange}
              </TooltipItem>
              <TooltipItem
                title={t`Band balances`}
              >{`${calculateBandShare(data.bandCollateralValue, data.bandTotalValue)} / ${calculateBandShare(data.bandBorrowedAmount, data.bandTotalValue)}`}</TooltipItem>
              <TooltipItem variant="subItem" title={collateralToken?.symbol}>
                {formatAbbreviatedNumber(data.bandCollateralAmount)}
              </TooltipItem>
              <TooltipItem variant="subItem" title={borrowToken?.symbol}>
                {formatAbbreviatedNumber(data.bandBorrowedAmount)}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Band liquidity`}>
              {formatBorrowTokenValue(data.bandTotalValue, borrowToken?.symbol)}
            </TooltipItem>
          </>
        )}
      </TooltipWrapper>
    </Box>
  )
}
