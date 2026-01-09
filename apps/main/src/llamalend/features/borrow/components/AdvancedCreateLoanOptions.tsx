import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import RouteDetails from '@/llamalend/widgets/RouteDetails'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanRouteImage } from '../../../queries/create-loan/create-loan-route-image.query'
import { useLiquidationRangeChartData } from '../hooks/useLiquidationRangeChartData'
import type { CreateLoanForm, CreateLoanFormQueryParams, Token } from '../types'
import { LiquidationRangeSlider } from './LiquidationRangeSlider'

const { Spacing } = SizesAndSpaces

const chartHeight = 185

export const AdvancedCreateLoanOptions = ({
  network,
  params,
  values: { debt, userBorrowed, leverageEnabled, range },
  setRange,
  market,
  collateralToken,
  borrowToken,
}: {
  network: INetworkName
  params: CreateLoanFormQueryParams
  values: CreateLoanForm
  setRange: (n: number) => void
  market: LlamaMarketTemplate | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const { data: routeImage, isLoading: routeImageLoading } = useCreateLoanRouteImage(params, leverageEnabled)
  const { data: expectedCollateral, isLoading: expectedCollateralLoading } = useCreateLoanExpectedCollateral(
    params,
    leverageEnabled,
  )

  return (
    <Stack gap={Spacing.sm} marginBlock={Spacing.sm}>
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
          data={useLiquidationRangeChartData(params)}
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
