import { Token } from '@/llamalend/features/borrow/types'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Typography } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'
import { ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

type TooltipContentProps = {
  data: ChartDataPoint
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

const calculateBandShare = (numerator: number | undefined, denominator: number | undefined): string =>
  typeof denominator === 'number' && denominator > 0 && typeof numerator === 'number'
    ? `${formatPercent((numerator / denominator) * 100)}`
    : '?'

const formatAbbreviatedNumber = (value: number | undefined): string =>
  typeof value === 'number' ? `${formatNumber(value, { abbreviate: true })}` : '?'

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const hasMarketData =
    (typeof data.bandCollateralAmount === 'number' && data.bandCollateralAmount > 0) ||
    (typeof data.bandBorrowedAmount === 'number' && data.bandBorrowedAmount > 0)
  const hasUserData = !!(data.userBandCollateralValueUsd || data.userBandBorrowedValueUsd)
  const collateralBandShare = calculateBandShare(data.bandCollateralValueUsd, data.bandTotalCollateralValueUsd)
  const borrowedBandShare = calculateBandShare(data.bandBorrowedValueUsd, data.bandTotalCollateralValueUsd)
  const userBandShare = calculateBandShare(data.userBandTotalCollateralValueUsd, data.bandTotalCollateralValueUsd)

  return (
    <Box sx={{ padding: Spacing.md, backgroundColor: (t) => t.design.Layer[3].Fill }}>
      <TooltipWrapper>
        <Typography variant="bodyMBold" color="textPrimary">
          {t`LLAMMA Band`}
        </Typography>
        <Typography variant="bodySRegular">{t`Active price range where collateral and debt rebalance.`}</Typography>
        {hasUserData && (
          <TooltipItems secondary>
            <TooltipItem title={t`Your share of band`}>{userBandShare}</TooltipItem>
            <TooltipItem variant="subItem" title={collateralToken?.symbol}>
              {formatAbbreviatedNumber(data.userBandCollateralAmount)}
              {`${formatUsd(data.userBandCollateralValueUsd ?? 0)}`}
            </TooltipItem>
            <TooltipItem variant="subItem" title={borrowToken?.symbol}>
              {formatAbbreviatedNumber(data.userBandBorrowedAmount)}
              {`${formatUsd(data.userBandBorrowedValueUsd ?? 0)}`}
            </TooltipItem>
          </TooltipItems>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`}>
                {typeof data.p_down === 'number' && typeof data.p_up === 'number'
                  ? `${formatNumber(data.p_down, { unit: 'dollar', abbreviate: false })} - ${formatNumber(data.p_up, { unit: 'dollar', abbreviate: false })}`
                  : '?'}
              </TooltipItem>
              <TooltipItem title={t`Band balances`}>{`${collateralBandShare} / ${borrowedBandShare}`}</TooltipItem>
              <TooltipItem variant="subItem" title={collateralToken?.symbol}>
                {formatAbbreviatedNumber(data.bandCollateralAmount)}
                {`${formatUsd(data.bandCollateralValueUsd ?? 0)}`}
              </TooltipItem>
              <TooltipItem variant="subItem" title={borrowToken?.symbol}>
                {formatAbbreviatedNumber(data.bandBorrowedAmount)}
                {`${formatUsd(data.bandBorrowedValueUsd ?? 0)}`}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Band liquidity`}>
              {typeof data.bandTotalCollateralValueUsd === 'number'
                ? `${formatUsd(data.bandTotalCollateralValueUsd ?? 0)}`
                : '?'}
            </TooltipItem>
          </>
        )}
      </TooltipWrapper>
    </Box>
  )
}
