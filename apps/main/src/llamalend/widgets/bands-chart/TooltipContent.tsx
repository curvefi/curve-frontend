import { Token } from '@/llamalend/features/borrow/types'
import { TooltipItem, TooltipItems, TooltipWrapper } from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Box, Stack, useTheme } from '@mui/material'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChartDataPoint } from './types'

const { Spacing } = SizesAndSpaces

const ColorSquare = ({ color }: { color: string }) => (
  <Box sx={{ width: '10px', height: '10px', backgroundColor: color, borderRadius: '2px' }} />
)

const AmountDisplay = ({ amount, valueUsd }: { amount: number; valueUsd: number }) => {
  if (amount === 0) {
    return <>0</>
  }
  return (
    <>
      {formatNumber(amount, { unit: 'dollar' })} ≈ ${formatNumber(valueUsd, { unit: 'dollar' })}
    </>
  )
}

interface DataSectionProps {
  title: string
  color: string
  collateralAmount: number
  collateralValueUsd: number
  borrowedAmount: number
  borrowedValueUsd: number
  collateralTokenSymbol: string | undefined
  borrowTokenSymbol: string | undefined
}

const DataSection = ({
  title,
  color,
  collateralAmount,
  collateralValueUsd,
  borrowedAmount,
  borrowedValueUsd,
  collateralTokenSymbol,
  borrowTokenSymbol,
}: DataSectionProps) => (
  <TooltipItems>
    <TooltipItem title={title} variant="independent" />
    <TooltipItem title={collateralTokenSymbol ?? t`Collateral`}>
      <span>
        <ColorSquare color={color} />
        <AmountDisplay amount={collateralAmount} valueUsd={collateralValueUsd} />
      </span>
    </TooltipItem>
    <TooltipItem title={borrowTokenSymbol ?? t`Borrowed`}>
      <span>
        <ColorSquare color={color} />
        <AmountDisplay amount={borrowedAmount} valueUsd={borrowedValueUsd} />
      </span>
    </TooltipItem>
  </TooltipItems>
)

interface TooltipContentProps {
  data: ChartDataPoint
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}

export const TooltipContent = ({ data, collateralToken, borrowToken }: TooltipContentProps) => {
  const theme = useTheme()
  const marketBandColor = theme.design.Color.Neutral[300]
  const userBandColor = theme.design.Color.Neutral[500]

  const hasMarketData = data.bandCollateralValueUsd > 0 || data.bandBorrowedValueUsd > 0
  const hasUserData = data.userBandCollateralValueUsd > 0 || data.userBandBorrowedValueUsd > 0

  return (
    <Box sx={{ padding: Spacing.md, backgroundColor: (t) => t.design.Layer[3].Fill }}>
      <Typography variant="bodyMBold" color="textPrimary" component="div">
        {t`Band`} {data.n}
      </Typography>
      <TooltipWrapper>
        {hasMarketData && (
          <DataSection
            title={t`Market`}
            color={marketBandColor}
            collateralAmount={data.bandCollateralAmount}
            collateralValueUsd={data.bandCollateralValueUsd}
            borrowedAmount={data.bandBorrowedAmount}
            borrowedValueUsd={data.bandBorrowedValueUsd}
            collateralTokenSymbol={collateralToken?.symbol}
            borrowTokenSymbol={borrowToken?.symbol}
          />
        )}

        {hasUserData && (
          <DataSection
            title={t`User`}
            color={userBandColor}
            collateralAmount={data.userBandCollateralAmount}
            collateralValueUsd={data.userBandCollateralValueUsd}
            borrowedAmount={data.userBandBorrowedAmount}
            borrowedValueUsd={data.userBandBorrowedValueUsd}
            collateralTokenSymbol={collateralToken?.symbol}
            borrowTokenSymbol={borrowToken?.symbol}
          />
        )}

        {data.p_up && (
          <TooltipItems>
            <TooltipItem title={t`Range`}>
              <span>
                ${formatNumber(data.p_down, { unit: 'dollar' })} - ${formatNumber(data.p_up, { unit: 'dollar' })}
              </span>
            </TooltipItem>
          </TooltipItems>
        )}
      </TooltipWrapper>
    </Box>
  )
}
