import { Token } from '@/llamalend/features/borrow/types'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

const ColorSquare = ({ color }: { color: string }) => (
  <Box sx={{ width: '10px', height: '10px', backgroundColor: color, borderRadius: '2px' }} />
)

const AmountDisplay = ({ amount, valueUsd }: { amount: number; valueUsd: number }) =>
  amount === 0
    ? 0
    : `${formatNumber(amount, { notation: 'compact' })} ≈ $${formatNumber(valueUsd, { notation: 'compact' })}`

const SubTitleComp = ({ title, color }: { title: string; color: string }) => (
  <Stack direction="row" alignItems="center" gap={Spacing.sm}>
    <ColorSquare color={color} />
    {title}
  </Stack>
)

interface DataSectionProps {
  title: string
  collateralColor: string
  borrowedColor: string
  collateralAmount?: number
  collateralValueUsd?: number
  borrowedAmount?: number
  borrowedValueUsd?: number
  collateralTokenSymbol: string | undefined
  borrowTokenSymbol: string | undefined
  isLiquidationBand: boolean
}

const DataSection = ({
  title,
  collateralColor,
  borrowedColor,
  collateralAmount = 0,
  collateralValueUsd = 0,
  borrowedAmount = 0,
  borrowedValueUsd = 0,
  collateralTokenSymbol,
  borrowTokenSymbol,
  isLiquidationBand,
}: DataSectionProps) => (
  <TooltipItems secondary>
    <TooltipItem title={title} variant="primary" />
    <TooltipItem
      title={
        <SubTitleComp
          title={`${collateralTokenSymbol ?? t`Collateral`} ${isLiquidationBand ? t`(Soft liquidation)` : ''}`}
          color={collateralColor}
        />
      }
    />
    <TooltipItem title={<AmountDisplay amount={collateralAmount} valueUsd={collateralValueUsd} />} />
    <TooltipItem title={<SubTitleComp title={borrowTokenSymbol ?? t`Borrowed`} color={borrowedColor} />} />
    <TooltipItem title={<AmountDisplay amount={borrowedAmount} valueUsd={borrowedValueUsd} />} />
  </TooltipItems>
)

interface TooltipContentProps {
  data: ChartDataPoint
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const theme = useTheme()
  const collateralColor = theme.design.Color.Neutral[300]
  const borrowedColor = theme.design.Color.Neutral[500]

  const hasMarketData = !!(data.bandCollateralValueUsd || data.bandBorrowedValueUsd)
  const hasUserData = !!(data.userBandCollateralValueUsd || data.userBandBorrowedValueUsd)

  return (
    <Box sx={{ padding: Spacing.sm, backgroundColor: (t) => t.design.Layer[3].Fill }}>
      <TooltipWrapper>
        <TooltipItems>
          <Typography variant="bodyMBold" color="textPrimary" component="div">
            {t`Band`} {data.n}
          </Typography>
          {data.p_up && (
            <TooltipItem
              title={`$${formatNumber(data.p_down, { unit: 'dollar' })} - $${formatNumber(data.p_up, { unit: 'dollar' })}`}
            />
          )}
        </TooltipItems>
        {hasMarketData && (
          <DataSection
            title={t`Band balances`}
            collateralColor={collateralColor}
            borrowedColor={borrowedColor}
            collateralAmount={data.bandCollateralAmount}
            collateralValueUsd={data.bandCollateralValueUsd}
            borrowedAmount={data.bandBorrowedAmount}
            borrowedValueUsd={data.bandBorrowedValueUsd}
            collateralTokenSymbol={collateralToken?.symbol}
            borrowTokenSymbol={borrowToken?.symbol}
            isLiquidationBand={data.isLiquidationBand === 'SL'}
          />
        )}

        {hasUserData && (
          <DataSection
            title={t`User band balances`}
            collateralColor={collateralColor}
            borrowedColor={borrowedColor}
            collateralAmount={data.userBandCollateralAmount}
            collateralValueUsd={data.userBandCollateralValueUsd}
            borrowedAmount={data.userBandBorrowedAmount}
            borrowedValueUsd={data.userBandBorrowedValueUsd}
            collateralTokenSymbol={collateralToken?.symbol}
            borrowTokenSymbol={borrowToken?.symbol}
            isLiquidationBand={data.isLiquidationBand === 'SL'}
          />
        )}
      </TooltipWrapper>
    </Box>
  )
}
