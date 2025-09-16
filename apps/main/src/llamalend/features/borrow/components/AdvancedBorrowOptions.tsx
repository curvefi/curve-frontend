import type { NetworkEnum } from '@/llamalend/llamalend.types'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import RouteDetails from '@/llamalend/widgets/RouteDetails'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { BorrowForm, BorrowFormQueryParams, LlamaMarketTemplate, Token } from '../borrow.types'
import { useLiquidationRangeChartData } from '../hooks/useLiquidationRangeChartData'
import { useBorrowExpectedCollateral } from '../queries/borrow-expected-collateral.query'
import { useBorrowRouteImage } from '../queries/borrow-route-image.query'
import { LiquidationRangeSlider } from './LiquidationRangeSlider'

const { Spacing } = SizesAndSpaces

const chartHeight = 185

export const AdvancedBorrowOptions = ({
  network,
  params,
  values: { debt, userBorrowed, leverageEnabled, range },
  setRange,
  market,
  enabled,
  collateralToken,
  borrowToken,
}: {
  network: NetworkEnum
  params: BorrowFormQueryParams
  values: BorrowForm
  setRange: (n: number) => void
  market: LlamaMarketTemplate | undefined
  enabled: boolean
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const {
    data: routeImage,
    isLoading: routeImageLoading,
    error: routeImageError,
  } = useBorrowRouteImage(params, leverageEnabled)
  const {
    data: expectedCollateral,
    isLoading: expectedCollateralLoading,
    error: expectedCollateralError,
  } = useBorrowExpectedCollateral(params, leverageEnabled)

  return (
    <Stack gap={Spacing.sm} marginBlock={Spacing.lg}>
      <LiquidationRangeSlider market={market} range={range} setRange={setRange} />
      <Stack
        sx={{
          '--chart_reference_line--color': (t) => t.design.Color.Primary[500],
          '--health_mode_healthy_darkBg--color': (t) => t.design.Text.TextColors.Feedback.Success,
          '& .recharts-reference-line-line': { strokeDasharray: '6' },
        }}
      >
        <Typography variant="bodyXsRegular">{t`Liquidation range`}</Typography>
        <ChartLiquidationRange
          data={useLiquidationRangeChartData(params, enabled)}
          healthColorKey="healthy"
          height={chartHeight}
          isDetailView
          showLegend
        />
      </Stack>
      {leverageEnabled && (
        <RouteDetails
          network={network}
          $minWidth="260px"
          loading={routeImageLoading || expectedCollateralLoading}
          swapFrom={borrowToken}
          swapTo={collateralToken}
          swapFromAmounts={[
            { value: `${debt ?? 0}`, label: t`Debt` },
            { value: `${userBorrowed ?? 0}`, label: t`Wallet` },
          ]}
          swapToAmounts={[expectedCollateral?.collateralFromDebt, expectedCollateral?.collateralFromUserBorrowed]}
          nonSwapAmount={{
            value: expectedCollateral?.userCollateral,
            label: '',
          }}
          total={expectedCollateral?.totalCollateral}
          avgPrice={expectedCollateral?.avgPrice}
          type="collateral"
          routeImage={routeImage}
        />
      )}
    </Stack>
  )
}
