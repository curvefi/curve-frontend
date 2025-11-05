import { Token } from '@/llamalend/features/borrow/types'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Typography } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

type TooltipContentProps = {
  data: ChartDataPoint
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const hasMarketData =
    (typeof data.bandCollateralAmount === 'number' && data.bandCollateralAmount > 0) ||
    (typeof data.bandBorrowedAmount === 'number' && data.bandBorrowedAmount > 0)
  const hasUserData = !!(data.userBandCollateralValueUsd || data.userBandBorrowedValueUsd)
  const collateralBandShare =
    typeof data.bandTotalCollateralValueUsd === 'number' &&
    data.bandTotalCollateralValueUsd > 0 &&
    typeof data.bandCollateralValueUsd === 'number'
      ? `${formatNumber((data.bandCollateralValueUsd / data.bandTotalCollateralValueUsd) * 100, { unit: 'percent' })}%`
      : '?'
  const borrowedBandShare =
    typeof data.bandTotalCollateralValueUsd === 'number' &&
    data.bandTotalCollateralValueUsd > 0 &&
    typeof data.bandBorrowedValueUsd === 'number'
      ? `${formatNumber((data.bandBorrowedValueUsd / data.bandTotalCollateralValueUsd) * 100, { unit: 'percent' })}%`
      : '?'
  const userBandShare =
    typeof data.bandTotalCollateralValueUsd === 'number' &&
    data.bandTotalCollateralValueUsd > 0 &&
    typeof data.userBandTotalCollateralValueUsd === 'number'
      ? `${formatNumber((data.userBandTotalCollateralValueUsd / data.bandTotalCollateralValueUsd) * 100, { unit: 'percent' })}%`
      : '?'

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
              {typeof data.userBandCollateralAmount === 'number'
                ? `${formatNumber(data.userBandCollateralAmount)}`
                : '?'}
              {`$${formatNumber(data.userBandCollateralValueUsd, { notation: 'compact' })}`}
            </TooltipItem>
            <TooltipItem variant="subItem" title={borrowToken?.symbol}>
              {typeof data.userBandBorrowedAmount === 'number' ? `${formatNumber(data.userBandBorrowedAmount)}` : '?'}
              {`$${formatNumber(data.userBandBorrowedValueUsd, { notation: 'compact' })}`}
            </TooltipItem>
          </TooltipItems>
        )}
        {hasMarketData && (
          <>
            <TooltipItems secondary>
              <TooltipItem title={t`Band range`}>
                {typeof data.p_down === 'number' && typeof data.p_up === 'number'
                  ? `$${formatNumber(data.p_down, { unit: 'dollar' })} - $${formatNumber(data.p_up, { unit: 'dollar' })}`
                  : '?'}
              </TooltipItem>
              <TooltipItem title={t`Band balances`}>{`${collateralBandShare} / ${borrowedBandShare}`}</TooltipItem>
              <TooltipItem variant="subItem" title={collateralToken?.symbol}>
                {typeof data.bandCollateralAmount === 'number' ? `${formatNumber(data.bandCollateralAmount)}` : '?'}
                {`$${formatNumber(data.bandCollateralValueUsd, { notation: 'compact' })}`}
              </TooltipItem>
              <TooltipItem variant="subItem" title={borrowToken?.symbol}>
                {typeof data.bandBorrowedAmount === 'number' ? `${formatNumber(data.bandBorrowedAmount)}` : '?'}
                {`$${formatNumber(data.bandBorrowedValueUsd, { notation: 'compact' })}`}
              </TooltipItem>
            </TooltipItems>
            <TooltipItem variant="primary" title={t`Band liquidity`}>
              {typeof data.bandTotalCollateralValueUsd === 'number'
                ? `$${formatNumber(data.bandTotalCollateralValueUsd, { notation: 'compact' })}`
                : '?'}
            </TooltipItem>
          </>
        )}
      </TooltipWrapper>
    </Box>
  )
}
