import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Stack, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { LegendBox } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { useBandsChartPalette } from './hooks/useBandsChartPalette'
import { BandsChartToken, ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

type TooltipContentProps = {
  data: ChartDataPoint
  collateralToken: BandsChartToken
  borrowToken: BandsChartToken
}

const calculateBandShare = (numerator: number | undefined, denominator: number | undefined): string =>
  typeof denominator === 'number' && denominator > 0 && typeof numerator === 'number'
    ? `${formatPercent((numerator / denominator) * 100)}`
    : '?'

const formatAbbreviatedNumber = (value: number | undefined): string =>
  typeof value === 'number' ? `${formatNumber(value, { abbreviate: true })}` : '?'

const formatUsdValue = (value: number | undefined): string => (typeof value === 'number' ? formatUsd(value) : '?')

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const palette = useBandsChartPalette()
  const hasMarketData =
    (typeof data.bandCollateralAmount === 'number' && data.bandCollateralAmount > 0) ||
    (typeof data.bandBorrowedAmount === 'number' && data.bandBorrowedAmount > 0)
  const hasUserData = !!(data.userBandCollateralValueUsd || data.userBandBorrowedValueUsd)

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
          <Stack gap={Spacing.sm} marginBottom={Spacing.sm}>
            <TooltipItems secondary>
              <TooltipItem title={t`Your share of band`} sx={{ marginBottom: Spacing.sm }}>
                {calculateBandShare(data.userBandTotalCollateralValueUsd, data.bandTotalCollateralValueUsd)}
              </TooltipItem>
              <TooltipItem
                title={t`Your position balances`}
              >{`${calculateBandShare(data.userBandCollateralValueUsd, data.userBandTotalCollateralValueUsd)} / ${calculateBandShare(data.userBandBorrowedValueUsd, data.userBandTotalCollateralValueUsd)}`}</TooltipItem>
              <TooltipItem
                variant="subItem"
                title={collateralToken?.symbol}
                titleAdornment={<LegendBox outline="none" fill={palette.userCollateralShareColor} />}
              >
                {formatAbbreviatedNumber(data.userBandCollateralAmount)}
                {formatUsdValue(data.userBandCollateralValueUsd)}
              </TooltipItem>
              <TooltipItem
                variant="subItem"
                title={borrowToken?.symbol}
                titleAdornment={<LegendBox outline="none" fill={palette.userBorrowedShareColor} />}
              >
                {formatAbbreviatedNumber(data.userBandBorrowedAmount)}
                {formatUsdValue(data.userBandBorrowedValueUsd)}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Your band liquidity`}>
              {formatUsdValue(data.userBandTotalCollateralValueUsd)}
            </TooltipItem>
          </Stack>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`} sx={{ marginBottom: Spacing.sm }}>
                {typeof data.p_down === 'number' && typeof data.p_up === 'number'
                  ? `${formatNumber(data.p_down, { unit: 'dollar', abbreviate: false, highPrecision: true, minimumSignificantDigits: 4, maximumSignificantDigits: 4 })} - ${formatNumber(data.p_up, { unit: 'dollar', abbreviate: false, highPrecision: true, minimumSignificantDigits: 4, maximumSignificantDigits: 4 })}`
                  : '?'}
              </TooltipItem>
              <TooltipItem
                title={t`Band balances`}
              >{`${calculateBandShare(data.bandCollateralValueUsd, data.bandTotalCollateralValueUsd)} / ${calculateBandShare(data.bandBorrowedValueUsd, data.bandTotalCollateralValueUsd)}`}</TooltipItem>
              <TooltipItem variant="subItem" title={collateralToken?.symbol}>
                {formatAbbreviatedNumber(data.bandCollateralAmount)}
                {formatUsdValue(data.bandCollateralValueUsd)}
              </TooltipItem>
              <TooltipItem variant="subItem" title={borrowToken?.symbol}>
                {formatAbbreviatedNumber(data.bandBorrowedAmount)}
                {formatUsdValue(data.bandBorrowedValueUsd)}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Band liquidity`}>
              {formatUsdValue(data.bandTotalCollateralValueUsd)}
            </TooltipItem>
          </>
        )}
      </TooltipWrapper>
    </Box>
  )
}
