import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
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
  const hasMarketData =
    (typeof data.bandCollateralAmount === 'number' && data.bandCollateralAmount > 0) ||
    (typeof data.bandBorrowedAmount === 'number' && data.bandBorrowedAmount > 0)
  const hasUserData = !!(data.userBandCollateralValueUsd || data.userBandBorrowedValueUsd)
  const collateralBandShare = calculateBandShare(data.bandCollateralValueUsd, data.bandTotalCollateralValueUsd)
  const borrowedBandShare = calculateBandShare(data.bandBorrowedValueUsd, data.bandTotalCollateralValueUsd)
  const userBandShare = calculateBandShare(data.userBandTotalCollateralValueUsd, data.bandTotalCollateralValueUsd)

  return (
    <Box
      sx={{ padding: Spacing.md, backgroundColor: (t) => t.design.Layer[1].Fill }}
      onClick={(e) => e.stopPropagation()}
    >
      <TooltipWrapper>
        <Typography variant="bodyMBold" color="textPrimary">
          {t`LLAMMA Band`}
        </Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          {t`Active price range where collateral and debt rebalance.`}
        </Typography>
        {hasUserData && (
          <TooltipItems secondary>
            <TooltipItem title={t`Your share of band`}>{userBandShare}</TooltipItem>
            <TooltipItem variant="subItem" title={collateralToken?.symbol}>
              {formatAbbreviatedNumber(data.userBandCollateralAmount)}
              {formatUsdValue(data.userBandCollateralValueUsd)}
            </TooltipItem>
            <TooltipItem variant="subItem" title={borrowToken?.symbol}>
              {formatAbbreviatedNumber(data.userBandBorrowedAmount)}
              {formatUsdValue(data.userBandBorrowedValueUsd)}
            </TooltipItem>
          </TooltipItems>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`}>
                {typeof data.p_down === 'number' && typeof data.p_up === 'number'
                  ? `${formatNumber(data.p_down, { unit: 'dollar', abbreviate: false, highPrecision: true, minimumSignificantDigits: 4, maximumSignificantDigits: 4 })} - ${formatNumber(data.p_up, { unit: 'dollar', abbreviate: false, highPrecision: true, minimumSignificantDigits: 4, maximumSignificantDigits: 4 })}`
                  : '?'}
              </TooltipItem>
              <TooltipItem title={t`Band balances`}>{`${collateralBandShare} / ${borrowedBandShare}`}</TooltipItem>
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
